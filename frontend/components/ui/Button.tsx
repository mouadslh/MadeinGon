import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline:
    "min-h-tap inline-flex items-center justify-center px-6 py-3 rounded-card border-2 border-ochre text-ochre hover:bg-ochre hover:text-white transition-colors",
  ghost: "min-h-tap inline-flex items-center justify-center px-4 py-3 text-atlantic hover:text-terracotta",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`${variants[variant]} ${fullWidth ? "w-full" : ""} ${className} disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
