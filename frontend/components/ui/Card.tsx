import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-surface p-4 md:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
