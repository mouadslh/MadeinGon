import { redirect } from "next/navigation";

export default function AuthLoginPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/login`);
}
