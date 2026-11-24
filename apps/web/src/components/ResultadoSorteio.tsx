"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ResultadoDoSorteio } from "@/lib/api";
import { linkDeRevelacao, linkDoWhatsApp } from "@/lib/textos";
import { IconeWhatsApp } from "./IconeWhatsApp";

interface Props {
  resultado: ResultadoDoSorteio;
  saindo: boolean;
  aoRecomecar: () => void;
}

export function ResultadoSorteio({ resultado, saindo, aoRecomecar }: Props) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [enviados, setEnviados] = useState<Set<string>>(new Set());
  const temporizador = useRef(0);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const origem = window.location.origin;

  useEffect(() => {
    tituloRef.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(temporizador.current);
  }, []);

  function marcarEnviado(participante: string) {
    setEnviados((atuais) => new Set(atuais).add(participante));
  }

  async function copiar(participante: string, link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(participante);
      marcarEnviado(participante);
      window.clearTimeout(temporizador.current);
      temporizador.current = window.setTimeout(() => setCopiado(null), 2000);
    } catch {
      window.prompt(`Copie o link de ${participante}:`, link);
    }
  }

  return (
    <section
      aria-labelledby="titulo-resultado"
      className={`flex flex-col gap-6 ${saindo ? "saindo" : ""}`}
    >
      <div className="entrar flex flex-col gap-2">
        <h2 id="titulo-resultado" ref={tituloRef} tabIndex={-1} className="t-h2 outline-none">
          Sorteio feito
        </h2>
        <p className="text-muted">
          Grupo “{resultado.grupo}”. Mande cada link só para a pessoa certa: ele
          mostra quem ela tirou.
        </p>
      </div>

      <ul
        className="divide-y divide-line border-y border-line"
        aria-label="Links de cada pessoa"
      >
        {resultado.links.map(({ participante, token }, indice) => {
          const link = linkDeRevelacao(origem, token);
          const foiCopiado = copiado === participante;
          return (
            <li
              key={participante}
              // Celular: nome e "Copiar link" na primeira linha, WhatsApp
              // embaixo, com a largura toda. A partir de 640px, tudo numa linha.
              className="linha-resultado grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              style={{ "--i": indice + 1 } as CSSProperties}
            >
              <div className="flex min-h-11 min-w-0 items-center gap-2">
                <span className="truncate font-medium">{participante}</span>
                {enviados.has(participante) && (
                  <span className="t-pequeno inline-flex h-6 shrink-0 items-center gap-1 rounded-sm bg-success-bg px-2 font-medium text-success">
                    <Check aria-hidden size={14} strokeWidth={2} />
                    enviado
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => copiar(participante, link)}
                className="botao-texto whitespace-nowrap"
                aria-label={
                  foiCopiado
                    ? `Link de ${participante} copiado`
                    : `Copiar o link de ${participante}`
                }
              >
                <span className="troca">
                  <span data-oculto={foiCopiado}>
                    <Copy aria-hidden size={18} strokeWidth={1.5} />
                    Copiar link
                  </span>
                  <span data-oculto={!foiCopiado}>
                    <Check aria-hidden size={18} strokeWidth={1.5} />
                    Copiado
                  </span>
                </span>
              </button>
              <a
                href={linkDoWhatsApp(participante, resultado.grupo, link)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => marcarEnviado(participante)}
                className="botao-secundario col-span-2 whitespace-nowrap sm:col-span-1"
                aria-label={`Enviar o link de ${participante} no WhatsApp`}
              >
                <IconeWhatsApp className="size-[18px]" />
                Enviar no WhatsApp
              </a>
            </li>
          );
        })}
      </ul>

      <p className="t-pequeno text-muted">
        Os links não ficam salvos em lugar nenhum. Envie todos antes de fechar
        esta página; se fechar, faça um novo sorteio.
      </p>

      <button
        type="button"
        onClick={aoRecomecar}
        className="botao-texto self-start"
      >
        Fazer outro sorteio
      </button>
    </section>
  );
}
