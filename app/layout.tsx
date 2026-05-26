import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RentCNCmachine.com",
    template: "%s | RentCNCmachine.com",
  },
  description:
    "Türkiye'deki CNC fasoncularını dünya alıcılarıyla buluşturan B2B pazaryeri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
