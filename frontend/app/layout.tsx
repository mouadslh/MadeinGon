import "./globals.css";
import "../styles/goun.css";
import { gounFontVariables } from "@/lib/goun-fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${gounFontVariables} antialiased`}>{children}</body>
    </html>
  );
}
