import { Suspense } from "react";
import UnauthorizedContent from "./UnauthorizedContent";

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center text-night/60">…</div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
