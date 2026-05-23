import Link from "next/link";

export default function UnauthorizedPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || "fr";

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-ochre mb-4">403</h1>
      <p className="mb-8">Vous n&apos;avez pas accès à cette page.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={`/${locale}`} className="btn-primary">
          Retour à l&apos;accueil
        </Link>
        <Link href={`/${locale}/logout`} className="btn-secondary">
          Deconnexion
        </Link>
      </div>
    </div>
  );
}
