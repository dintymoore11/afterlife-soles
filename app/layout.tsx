import type { Metadata } from "next";
import { Archivo, Archivo_Black } from "next/font/google";
import "./globals.css";
import "./product.css";
import "./brand.css";
import "./footer-brand.css";
import { Footer, Header } from "./components/SiteChrome";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-body" });
const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "AfterLife Soles — Renew Your Climbing Shoes", template: "%s | AfterLife Soles" },
  description: "A DIY toe repair kit that helps bring worn climbing shoes back to life.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "AfterLife Soles — Renew Your Climbing Shoes", description: "A DIY toe repair kit that helps bring worn climbing shoes back to life.", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "AfterLife Soles — Renew Your Climbing Shoes", description: "Repair more. Replace less.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${display.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
