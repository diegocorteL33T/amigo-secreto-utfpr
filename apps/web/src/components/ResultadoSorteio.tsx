"use client";

import { useState } from "react";
import type { ResultadoDoSorteio } from "@/lib/api";
import { linkDeRevelacao, linkDoWhatsApp } from "@/lib/textos";

interface Props {
  resultado: ResultadoDoSorteio;
  aoRecomecar: () => void;
}

export function ResultadoSorteio({ resultado, aoRecomecar }: Props) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [enviados, setEnviados] = useState<Set<string>>(new Set());
  const origem = window.location.origin;

  function marcarEnviado(participante: string) {
    setEnviados(new Set(enviados).add(participante));
  }

  async function copiar(participante: string, link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(participante);
      marcarEnviado(participante);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      window.prompt(`Copie o link de ${participante}:`, link);
    }
  }

  return (
    <section className="flex flex-col gap-6" aria-live="polite">
      <div className="rounded-xl bg-success-soft px-5 py-4">
        <h2 className="text-lg font-semibold text-success">
          Sorteio feito para “{resultado.grupo}”!
        </h2>
        <p className="mt-1 text-sm">
          Mande cada link só para a pessoa certa. Cada um revela o amigo secreto
          de uma pessoa, então não abra os links dos outros.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {resultado.links.map(({ participante, token }) => {
          const link = linkDeRevelacao(origem, token);
          return (
            <li
              key={participante}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex items-center gap-2 font-medium">
                {participante}
                {enviados.has(participante) && (
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                    enviado
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copiar(participante, link)}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-foreground/30 sm:flex-none"
                >
                  {copiado === participante ? "Copiado!" : "Copiar link"}
                </button>
                <a
                  href={linkDoWhatsApp(participante, resultado.grupo, link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => marcarEnviado(participante)}
                  className="flex-1 rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground transition hover:bg-accent-hover sm:flex-none"
                >
                  Enviar no WhatsApp
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-muted">
        Os links não ficam salvos em lugar nenhum: se fechar esta página antes
        de enviar, faça um novo sorteio.
      </p>

      <button
        type="button"
        onClick={aoRecomecar}
        className="self-start rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:border-foreground/30"
      >
        Fazer outro sorteio
      </button>
    </section>
  );
}
