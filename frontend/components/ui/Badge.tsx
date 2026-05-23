import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "verified";

const styles: Record<BadgeVariant, string> = {
  default: "bg-dune text-night",
  success: "bg-green-100 text-[var(--color-success)]",
  warning: "bg-amber-100 text-[var(--color-warning)]",
  danger: "bg-red-100 text-[var(--color-danger)]",
  verified: "bg-ochre/20 text-ochre border border-ochre",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
