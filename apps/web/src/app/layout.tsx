import type { Metadata } from "next";
import "@fontsource/archivo/800.css";
import "@fontsource/archivo/900.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800-italic.css";
import "@brofit/ui/tokens.css";
import "./globals.css";
import "./mockups.css";
import "./live.css";
import { Header, Footer } from "@/components/shell";
import { SessionProvider } from "@/components/session";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    default: "BROFIT — ya | Entrena donde quieras.",
    template: "%s | BROFIT — ya",
  },
  description:
    "Descubre gimnasios y compara pases y membresías multigimnasio. Prototipo DEMO de BROFIT — ya.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" data-scroll-behavior="smooth">
      <body>
        <SessionProvider>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
