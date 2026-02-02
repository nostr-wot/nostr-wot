import { forwardRef, HTMLAttributes } from "react";

type CardVariant = "default" | "interactive" | "gradient";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  gradient?: "purple" | "orange" | "green" | "blue";
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
  interactive:
    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 card-interactive hover:border-primary dark:hover:border-primary",
  gradient: "rounded-xl border",
};

const gradientStyles: Record<string, string> = {
  purple:
    "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800",
  orange:
    "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800",
  green:
    "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800",
  blue: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "default",
    padding = "md",
    gradient = "purple",
    className = "",
    children,
    ...props
  },
  ref
) {
  const baseStyles = variantStyles[variant];
  const gradientStyle = variant === "gradient" ? gradientStyles[gradient] : "";
  const paddingStyle = paddingStyles[padding];

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${gradientStyle} ${paddingStyle} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
