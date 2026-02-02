import { Link } from "@/i18n/routing";
import { AnchorHTMLAttributes } from "react";

type LinkButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "white" | "white-outline";
type LinkButtonSize = "sm" | "md" | "lg";

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<LinkButtonVariant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
  ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors",
  white: "btn bg-white text-primary hover:bg-gray-100",
  "white-outline": "btn bg-white/20 text-white border border-white/30 hover:bg-white/30",
};

const sizeStyles: Record<LinkButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "",
  lg: "text-lg px-6 py-4",
};

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  const classes = `${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

export default LinkButton;
