import { AnchorHTMLAttributes } from "react";

type ExternalLinkButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "white" | "white-outline";
type ExternalLinkButtonSize = "sm" | "md" | "lg";

interface ExternalLinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> {
  href: string;
  variant?: ExternalLinkButtonVariant;
  size?: ExternalLinkButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ExternalLinkButtonVariant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
  ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors",
  white: "btn bg-white text-primary hover:bg-gray-100",
  "white-outline": "btn bg-white/20 text-white border border-white/30 hover:bg-white/30",
};

const sizeStyles: Record<ExternalLinkButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "",
  lg: "text-lg px-6 py-4",
};

export function ExternalLinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ExternalLinkButtonProps) {
  const classes = `${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      {...props}
    >
      {children}
    </a>
  );
}

export default ExternalLinkButton;
