"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buscarRevelacao, ErroDaApi, type Revelacao as Dados } from "@/lib/api";
import { formatarData } from "@/lib/textos";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; dados: Dados };

export function Revelacao({ token }: { token: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [revelado, setRevelado] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarRevelacao(token)
      .then((dados) => ativo && setEstado({ tipo: "pronto", dados }))
      .catch(
        (e: unknown) =>
          ativo &&
          setEstado({
            tipo: "erro",
            mensagem:
              e instanceof ErroDaApi
                ? e.message
                : "Não foi possível abrir o link.",
          }),
      );
    return () => {
      ativo = false;
    };
  }, [token]);

  if (estado.tipo === "carregando") {
    return (
      <p className="text-muted" role="status">
        Abrindo seu link...
      </p>
    );
  }

  if (estado.tipo === "erro") {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Não deu para abrir o link</h1>
        <p
          className="rounded-lg bg-accent-soft px-4 py-3 text-accent"
          role="alert"
        >
          {estado.mensagem}
        </p>
        <Link href="/" className="text-sm font-medium underline">
          Criar um novo sorteio
        </Link>
      </div>
    );
  }

  const { grupo, participante, amigoSecreto, valorSugerido, dataEvento } =
    estado.dados;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {grupo}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Olá, {participante}!
        </h1>
        <p className="text-muted">
          Este link é só seu. Quando estiver num lugar sem ninguém olhando,
          revele seu amigo secreto.
        </p>
      </header>

      <div className="grid min-h-44 place-items-center rounded-2xl border border-border bg-card p-6 text-center">
        {revelado ? (
          <div className="animar-revelacao flex flex-col gap-2">
            <span className="text-sm text-muted">Você tirou</span>
            <strong className="text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
              {amigoSecreto}
            </strong>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevelado(true)}
            className="rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground transition hover:bg-accent-hover"
          >
            Revelar meu amigo secreto
          </button>
        )}
      </div>

      {(valorSugerido || dataEvento) && (
        <dl className="grid gap-4 sm:grid-cols-2">
          {valorSugerido && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <dt className="text-sm text-muted">Valor sugerido</dt>
              <dd className="font-medium">{valorSugerido}</dd>
            </div>
          )}
          {dataEvento && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <dt className="text-sm text-muted">Troca de presentes</dt>
              <dd className="font-medium">{formatarData(dataEvento)}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
