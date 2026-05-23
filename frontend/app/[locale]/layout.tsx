import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { LocaleChrome } from "@/components/layout/LocaleChrome";
import { LocaleHtmlAttributes } from "@/components/layout/LocaleHtmlAttributes";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlAttributes locale={locale} />
      <LocaleChrome locale={locale}>{children}</LocaleChrome>
    </NextIntlClientProvider>
  );
}
