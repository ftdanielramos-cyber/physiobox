import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ['400', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
}

export const metadata: Metadata = {
  title: "Physiobox",
  description: "Performance & Fisioterapia Desportiva",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Physiobox",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${barlow.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white font-[family-name:var(--font-barlow)] antialiased">
        {children}
      </body>
    </html>
  );
}