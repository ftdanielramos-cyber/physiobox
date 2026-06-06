import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhysioBox",
  description: "Performance & Fisioterapia Desportiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      {/* bg-neutral-900: Fundo cinza escuro desportivo (cor de asfalto/equipamento)
        font-sans uppercase-titles tracking-tight: Estilo de letra focado em marcas de desporto
      */}
      <body className="min-h-full flex flex-col bg-neutral-900 text-neutral-100 font-sans tracking-tight antialiased">
        {children}
      </body>
    </html>
  );
}