import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import ScrollReveal from "./ScrollReveal";

interface SectionHeaderProps {
  badge?: ReactNode;
  badgeIcon?: ReactNode;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  badge,
  badgeIcon,
  title,
  description,
  centered = true,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? "text-center" : ""} mb-12 lg:mb-16 ${className}`}>
      {(badge || badgeIcon) && (
        <div className={`inline-flex items-center gap-2 text-primary mb-6 ${centered ? "" : ""}`}>
          {badgeIcon}
          {badge && <span className="font-semibold text-sm uppercase tracking-wider">{badge}</span>}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      {description && (
        <p className={`text-lg text-gray-600 dark:text-gray-400 ${centered ? "max-w-2xl mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "white" | "gray" | "dark" | "gradient";
  padding?: "sm" | "md" | "lg";
}

const bgStyles = {
  white: "",
  gray: "bg-gray-50 dark:bg-gray-900",
  dark: "bg-gray-900 dark:bg-gray-950",
  gradient: "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/50",
};

const paddingStyles = {
  sm: "py-16",
  md: "py-20",
  lg: "py-24",
};

export function Section({
  children,
  className = "",
  background = "white",
  padding = "lg",
}: SectionProps) {
  return (
    <section className={`${bgStyles[background]} ${paddingStyles[padding]} ${className}`}>
      <div className="max-w-6xl mx-auto px-6">{children}</div>
    </section>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBg?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconBg = "bg-primary/10",
  className = "",
}: FeatureCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${className}`}>
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

interface FeatureListItemProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  iconColor?: string;
}

export function FeatureListItem({
  icon,
  title,
  description,
  iconColor = "text-primary",
}: FeatureListItemProps) {
  return (
    <li className="flex items-start gap-3">
      {icon ? (
        <span className={`shrink-0 mt-0.5 ${iconColor}`}>{icon}</span>
      ) : (
        <span className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <div>
        <span className="font-medium">{title}</span>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </li>
  );
}

interface FeatureListProps {
  items: Array<{ title: string; description?: string }>;
  iconColor?: string;
  className?: string;
}

export function FeatureList({ items, iconColor, className = "" }: FeatureListProps) {
  return (
    <ul className={`space-y-4 ${className}`}>
      {items.map((item, i) => (
        <FeatureListItem
          key={i}
          title={item.title}
          description={item.description}
          iconColor={iconColor}
        />
      ))}
    </ul>
  );
}

interface StatCardProps {
  value: ReactNode;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color = "text-primary" }: StatCardProps) {
  return (
    <div className="text-center">
      <div className={`text-3xl md:text-4xl font-bold ${color} mb-2`}>{value}</div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}

interface StatsGridProps {
  stats: Array<{ value: ReactNode; label: string; color?: string }>;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const colsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${colsClass[columns]} gap-8 text-center`}>
      {stats.map((stat, i) => (
        <ScrollReveal key={i} animation="fade-up" delay={i * 100}>
          <StatCard {...stat} />
        </ScrollReveal>
      ))}
    </div>
  );
}

interface ModeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  bestFor?: string;
  recommended?: boolean;
  recommendedLabel?: string;
  iconBg?: string;
  className?: string;
}

export function ModeCard({
  icon,
  title,
  description,
  features,
  bestFor,
  recommended,
  recommendedLabel = "Recommended",
  iconBg = "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
  className = "",
}: ModeCardProps) {
  const u = useTranslations("ui");
  const baseClass = recommended
    ? "relative bg-gradient-to-br from-primary/5 via-purple-500/5 to-indigo-500/5 rounded-2xl p-8 border-2 border-primary/30 h-full hover:shadow-xl hover:border-primary/50 transition-all duration-300"
    : "group bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700/50 h-full hover:shadow-lg hover:border-primary/30 transition-all duration-300";

  return (
    <div className={`${baseClass} ${className}`}>
      {recommended && (
        <div className="absolute -top-3 left-6">
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {recommendedLabel}
          </span>
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {bestFor && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-sm">
            <span className="text-gray-500">{u("bestFor")}</span>{" "}
            <span className="text-gray-700 dark:text-gray-300 font-medium">{bestFor}</span>
          </p>
        </div>
      )}
    </div>
  );
}

interface StepItemProps {
  step: number;
  title: string;
  description: string;
}

export function StepItem({ step, title, description }: StepItemProps) {
  return (
    <div className="flex items-start gap-6">
      <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-primary/30 shrink-0">
        {step}
      </div>
      <div className="flex-1 bg-white dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50 shadow-sm">
        <p className="font-bold text-lg">{title}</p>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

interface StepsListProps {
  steps: Array<{ title: string; description: string }>;
  showTimeline?: boolean;
}

export function StepsList({ steps, showTimeline = true }: StepsListProps) {
  return (
    <div className="relative">
      {showTimeline && (
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-indigo-500 hidden md:block" />
      )}
      <div className="space-y-6">
        {steps.map((step, i) => (
          <StepItem key={i} step={i + 1} title={step.title} description={step.description} />
        ))}
      </div>
    </div>
  );
}
