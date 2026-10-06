/** LinkedIn is opt-in for substantive Nostr WoT platform/team news only. */
export const LINKEDIN_CATEGORIES = ["platform-update", "team-update"];
export function linkedinEligible(data = {}) {
  return LINKEDIN_CATEGORIES.includes(data.linkedinCategory) &&
    typeof data.linkedinReason === "string" && data.linkedinReason.trim().length > 0;
}
export function eligibleChannelKeys(data = {}) {
  return ["linkedin", "nostr"].filter((key) =>
    typeof data[key] === "string" && data[key].trim().length > 0 &&
    (key !== "linkedin" || linkedinEligible(data))
  );
}
