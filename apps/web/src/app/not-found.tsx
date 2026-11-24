import type { Metadata } from "next";
import Link from "next/link";
import { Marca } from "@/components/Marca";

export const metadata: Metadata = {
  title: "Página não encontrada — Amigo Secreto",
};

export default function PaginaNaoEncontrada() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 md:px-8 lg:px-12">
      <header className="flex h-16 items-center">
        <Marca />
      </header>
      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center pb-16 pt-8 text-center">
        <h1 className="t-h1 entrar">Página não encontrada</h1>
        <p className="t-destaque entrar mt-4 max-w-[40ch] [--atraso:70ms]">
          O endereço que você abriu não existe ou mudou de lugar.
        </p>
        <Link
          href="/"
          className="botao-principal entrar mt-8 no-underline [--atraso:140ms]"
        >
          Criar um sorteio
        </Link>
      </main>
    </div>
  );
}
