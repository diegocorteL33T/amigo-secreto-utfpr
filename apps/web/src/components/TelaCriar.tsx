"use client";

import { useState } from "react";
import { CaixaPresente } from "./CaixaPresente";
import { FormularioSorteio } from "./FormularioSorteio";

export function TelaCriar() {
  const [pulo, setPulo] = useState(0);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start lg:gap-16">
      <section
        aria-labelledby="titulo"
        className="mx-auto flex w-full max-w-[560px] flex-col items-center text-center lg:sticky lg:top-12 lg:mx-0 lg:max-w-none lg:items-start lg:text-left"
      >
        <CaixaPresente
          modo="topo"
          pulo={pulo}
          className="h-40 w-full lg:order-last lg:mt-10 lg:h-80"
        />
        <h1 id="titulo" className="t-h1 entrar mt-4 lg:mt-0">
          Sorteie o amigo secreto do seu grupo
        </h1>
        <p className="t-destaque entrar mt-4 max-w-[34ch] [--atraso:70ms]">
          Cada pessoa recebe um link que mostra só quem ela tirou. Ninguém fica
          sabendo antes, e nada fica guardado em servidor.
        </p>
      </section>
      <FormularioSorteio aoSortear={() => setPulo((atual) => atual + 1)} />
    </div>
  );
}
