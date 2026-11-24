import type { Metadata, Viewport } from "next";
import { BotaoAnimacoes } from "@/components/BotaoAnimacoes";
import { FundoFlocos } from "@/components/FundoFlocos";
import { Marca } from "@/components/Marca";
import { Revelacao } from "@/components/Revelacao";

// Título genérico: a prévia do link no WhatsApp não pode entregar o resultado.
// O resultado é buscado só no navegador, depois que a página abre.
export const metadata: Metadata = {
  title: "Seu amigo secreto",
  description: "Abra para descobrir quem você tirou no amigo secreto.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Seu amigo secreto",
    description: "Abra para descobrir quem você tirou no amigo secreto.",
    siteName: "Amigo Secreto",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Amigo Secreto: sorteio com um link para cada pessoa",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2c2325",
};

export default async function PaginaDeRevelacao({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // data-tema="noite" troca as cores da página inteira (globals.css).
  return (
    <div data-tema="noite" className="flex flex-1 flex-col">
      <FundoFlocos tema="noite" />
      <header className="relative mx-auto flex h-16 w-full max-w-[560px] items-center justify-center px-4">
        <Marca />
        <BotaoAnimacoes className="absolute right-1.5" />
      </header>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-4 pb-12 pt-4">
        <Revelacao token={token} />
      </main>
    </div>
  );
}
