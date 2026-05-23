import { redirect } from "next/navigation";

export default function AdminCinnRedirect({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/admin/cin`);
}
