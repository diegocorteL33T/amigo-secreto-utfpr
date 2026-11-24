import { FormularioSorteio } from "@/components/FormularioSorteio";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Amigo Secreto
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Sorteie o amigo secreto do grupo sem ninguém ficar sabendo antes.
        </h1>
        <p className="text-muted text-pretty">
          Cadastre o grupo, sorteie e mande para cada pessoa um link que revela
          só o amigo secreto dela. Nada fica guardado em servidor.
        </p>
      </header>
      <FormularioSorteio />
    </main>
  );
}
