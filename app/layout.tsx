import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkBio — seus links, um lugar só",
  description: "Crie sua página de links e acompanhe quem clica em cada um.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
