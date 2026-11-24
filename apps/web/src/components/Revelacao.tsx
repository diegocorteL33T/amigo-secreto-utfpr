"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { buscarRevelacao, ErroDaApi, type Revelacao as Dados } from "@/lib/api";
import { formatarData } from "@/lib/textos";
import { CaixaPresente } from "./CaixaPresente";

/** Acima disso, o nome usa o tamanho do H1 para caber na tela. */
const NOME_LONGO = 18;

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem: string }
  | { tipo: "pronto"; dados: Dados };

export function Revelacao({ token }: { token: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [revelado, setRevelado] = useState(false);
  const nomeRef = useRef<HTMLDivElement>(null);

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

  // O botão some ao abrir: o foco vai para o nome, para quem usa teclado ou leitor de tela.
  useEffect(() => {
    if (revelado) nomeRef.current?.focus({ preventScroll: true });
  }, [revelado]);

  const dados = estado.tipo === "pronto" ? estado.dados : null;
  const revelar = () => setRevelado(true);

  let titulo: string;
  let texto: ReactNode = null;
  if (estado.tipo === "erro") {
    titulo = "Este link não abre";
    texto = estado.mensagem;
  } else if (dados) {
    titulo = `Olá, ${dados.participante}`;
    texto = (
      <>
        Amigo secreto do grupo{" "}
        <span className="font-medium text-rose">{dados.grupo}</span>. Este link
        é só seu: abra quando ninguém estiver olhando.
      </>
    );
  } else {
    titulo = "Seu amigo secreto";
  }

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <h1 className="t-h2 entrar w-full [overflow-wrap:anywhere]">{titulo}</h1>
      {texto && (
        <p className="entrar mt-3 max-w-[40ch] [--atraso:70ms]">{texto}</p>
      )}

      <CaixaPresente
        modo="revelacao"
        aberta={revelado}
        parada={estado.tipo === "erro"}
        aoTocar={dados && !revelado ? revelar : undefined}
        className="my-6 h-[45dvh] max-h-[26rem] min-h-64 w-full"
      />

      {estado.tipo === "erro" ? (
        <Link href="/" className="botao-texto">
          Criar um novo sorteio
        </Link>
      ) : !revelado || !dados ? (
        <button
          type="button"
          onClick={revelar}
          disabled={!dados}
          aria-busy={!dados}
          className="botao-principal w-full max-w-80"
        >
          {dados ? "Abrir o presente" : "Preparando seu presente…"}
        </button>
      ) : (
        <>
          <div
            ref={nomeRef}
            tabIndex={-1}
            className="surgir-nome flex w-full flex-col items-center gap-2 outline-none"
          >
            <p className="t-pequeno font-medium text-rose">Você tirou</p>
            <p
              className={`${dados.amigoSecreto.length > NOME_LONGO ? "t-h1" : "t-display"} w-full [overflow-wrap:anywhere]`}
            >
              {dados.amigoSecreto}
            </p>
          </div>

          {(dados.valorSugerido || dados.dataEvento) && (
            <dl
              className={`entrar mt-8 grid w-full divide-x divide-line rounded-sm bg-surface text-left [--atraso:700ms] ${dados.valorSugerido && dados.dataEvento ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {dados.valorSugerido && (
                <div className="flex flex-col gap-1 px-4 py-3">
                  <dt className="t-pequeno text-muted">Valor sugerido</dt>
                  <dd className="font-medium">{dados.valorSugerido}</dd>
                </div>
              )}
              {dados.dataEvento && (
                <div className="flex flex-col gap-1 px-4 py-3">
                  <dt className="t-pequeno text-muted">Troca de presentes</dt>
                  <dd className="font-medium">
                    {formatarData(dados.dataEvento)}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
