import type { Metadata } from "next";
import { Revelacao } from "@/components/Revelacao";

// Título genérico: a prévia do link no WhatsApp não pode entregar o resultado.
// O resultado é buscado só no navegador, depois que a página abre.
export const metadata: Metadata = {
  title: "Seu amigo secreto",
  description: "Abra para descobrir quem você tirou no amigo secreto.",
  robots: { index: false, follow: false },
};

export default async function PaginaDeRevelacao({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-12">
      <Revelacao token={token} />
    </main>
  );
}
