#!/usr/bin/env node
/**
 * Pre-generates lib/generated/route-modified.json: for each static route in
 * lib/sitemap-routes.mjs, the ISO commit date of the most recent git commit
 * that touched the page's backing source file (app/[locale]/.../page.tsx)
 * or, best-effort, its matching English message file
 * (messages/en/<messageKey>.json — a copy-only edit is a real content
 * change even when the component file didn't move). Consumed by
 * app/sitemap.ts so static routes get an honest `lastModified` instead of
 * `new Date()` stamped fresh on every build.
 *
 * HONESTY RULE: when a date cannot be determined for a route — git is
 * unavailable, the repo is a shallow clone, or the path has no commit
 * history — that route is OMITTED from the output entirely. Never fall
 * back to build time, file mtime, or a hardcoded constant: a fabricated
 * date is exactly the bug this generator exists to fix, just with extra
 * steps. app/sitemap.ts must in turn omit `lastModified` for any route
 * missing from this file, not substitute anything.
 *
 * CI TRAP: actions/checkout@v4 defaults to fetch-depth: 1 (a shallow clone
 * holding only the latest commit). In that state `git log -1 -- <file>`
 * returns the SAME head commit for every path, silently reproducing the
 * uniform-lastmod bug this generator exists to prevent, just laundered
 * through git instead of `new Date()`. This script detects that case via
 * `git rev-parse --is-shallow-repository` and refuses to emit ANY dates,
 * loudly, rather than emit wrong-but-uniform ones. Both
 * .github/workflows/ci.yml and .github/workflows/deploy.yml were updated
 * to `fetch-depth: 0` alongside this script specifically so that path is
 * never hit for real; the loud warning exists to catch a future regression
 * of that config rather than fail silently again.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { routes, sourceFileSegments, messageFileSegments } from "../lib/sitemap-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUTPUT_PATH = path.join(ROOT, "lib", "generated", "route-modified.json");

function isGitAvailable() {
  try {
    execFileSync("git", ["--version"], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * True when HEAD sits in a shallow clone (or when shallow-ness cannot be
 * determined — treated as shallow, since assuming full history is the
 * unsafe direction here).
 */
function isShallowClone() {
  try {
    const out = execFileSync(
      "git",
      ["rev-parse", "--is-shallow-repository"],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    return out !== "false";
  } catch {
    return true;
  }
}

/**
 * Most recent commit date (ISO 8601, `%cI`) touching any of the given
 * absolute file paths, or null if none exist on disk or none have commit
 * history. Passing multiple paths in one `git log` call is what gives us
 * "the newest of the files that exist" for free — git already orders by
 * commit date and `-1` takes the top one.
 */
function lastCommitDate(absPaths) {
  const existing = absPaths.filter((p) => fs.existsSync(p));
  if (existing.length === 0) return null;
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...existing],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

function writeOutput(result) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n");
}

function generate() {
  if (!isGitAvailable()) {
    console.warn(
      "[route-modified] git is not available — emitting no route dates. " +
        "Static routes will omit lastModified in the sitemap."
    );
    writeOutput({});
    return;
  }

  if (isShallowClone()) {
    console.warn("=".repeat(78));
    console.warn("[route-modified] WARNING: shallow git clone detected.");
    console.warn(
      "  `git log -1 -- <file>` returns the SAME commit for every path in a"
    );
    console.warn(
      "  shallow clone, which would silently reproduce the uniform-lastmod bug"
    );
    console.warn(
      "  this generator exists to fix (every static route would again claim"
    );
    console.warn(
      "  the same single 'last changed' date). Emitting NO dates instead."
    );
    console.warn(
      "  Fix: the checkout step must use `fetch-depth: 0`. See"
    );
    console.warn(
      "  .github/workflows/ci.yml and .github/workflows/deploy.yml."
    );
    console.warn("=".repeat(78));
    writeOutput({});
    return;
  }

  const result = {};
  let resolved = 0;
  let unresolved = 0;

  for (const route of routes) {
    const candidates = [sourceFileSegments(route.path)];
    const messageSegments = messageFileSegments(route.messageKey);
    if (messageSegments) candidates.push(messageSegments);

    const date = lastCommitDate(candidates.map((segs) => path.join(ROOT, ...segs)));

    if (date) {
      result[route.path] = date;
      resolved++;
    } else {
      unresolved++;
    }
  }

  writeOutput(result);
  console.log(
    `[route-modified] resolved ${resolved}/${routes.length} static routes` +
      (unresolved > 0 ? `, ${unresolved} without a date (omitted from output)` : "") +
      "."
  );
}

generate();
