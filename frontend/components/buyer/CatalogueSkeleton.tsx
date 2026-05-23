export function CatalogueSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" aria-busy="true" aria-label="Chargement">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface overflow-hidden">
          <div className="aspect-square skeleton-shimmer" />
          <div className="h-4 mt-4 mx-4 rounded skeleton-shimmer" />
          <div className="h-4 mt-2 mx-4 w-2/3 rounded skeleton-shimmer" />
          <div className="h-6 mt-4 mb-4 mx-4 w-1/3 rounded skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
