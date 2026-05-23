import { redirect } from "next/navigation";

/** Redirection : les CIN sont gérées dans Admin → Vendeurs */
export default function AdminCinRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/admin/sellers`);
}
