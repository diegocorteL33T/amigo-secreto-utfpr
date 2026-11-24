import type { Metadata, Viewport } from "next";
import { Funnel_Display, Funnel_Sans } from "next/font/google";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  display: "swap",
});

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  display: "swap",
});

// Endereço público, usado para montar a URL da imagem de prévia (Open Graph).
// Na Vercel, a variável abaixo é preenchida no build.
const urlDoSite = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const descricao =
  "Sorteie o amigo secreto do seu grupo e mande para cada pessoa um link que revela só quem ela tirou.";

export const metadata: Metadata = {
  metadataBase: new URL(urlDoSite),
  title: "Amigo Secreto",
  description: descricao,
  openGraph: {
    url: "/",
    title: "Amigo Secreto",
    description: descricao,
    siteName: "Amigo Secreto",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f0eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${funnelDisplay.variable} ${funnelSans.variable}`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
