import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SceneLayer from "@/components/scene/SceneLayer";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f3f0ea",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      name: site.name,
      url: site.url,
      email: `mailto:${site.email}`,
      jobTitle: site.role,
      sameAs: site.socials.map((s) => s.href),
    },
    { "@type": "WebSite", name: site.name, url: site.url },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Hide the intro before first paint if it already played this session */}
        <Script id="intro-seen" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem("intro-seen")==="1")document.documentElement.classList.add("intro-seen")}catch(e){}`}
        </Script>
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>
          <Preloader />
          <Cursor />
          <Header />
          <SceneLayer />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
