import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  Cormorant_Garamond,
  DM_Sans,
  Noto_Naskh_Arabic,
  Noto_Sans_Tifinagh,
  Rakkas,
} from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

const notoTifinagh = Noto_Sans_Tifinagh({
  variable: "--font-tifinagh",
  subsets: ["tifinagh"],
  weight: ["400"],
});

const rakkas = Rakkas({
  variable: "--font-rakkas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Moroccan Hammam Rituals`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${notoArabic.variable} ${notoTifinagh.variable} ${rakkas.variable}`}
    >
      <body>
        <Providers>
          {isAdmin ? (
            children
          ) : (
            <>
              <Header />
              <main className="site-main">{children}</main>
              <Footer />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
