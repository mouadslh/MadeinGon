import { redirect } from "next/navigation";

export default function LegacyNewProductRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/seller/products/new`);
}
