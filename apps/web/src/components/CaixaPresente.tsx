"use client";

import { useEffect, useRef, useState } from "react";
import type { CenaCaixa, ModoCaixa } from "@/lib/cena/caixa";
import { animacoesPausadas, useAnimacoesPausadas } from "@/lib/movimento";

interface Props {
  modo: ModoCaixa;
  aberta?: boolean;
  /** Sem flutuar nem girar (ex.: link inválido). */
  parada?: boolean;
  /** Cada vez que muda, a caixa dá um salto curto. */
  pulo?: number;
  /** Tocar na caixa também abre o presente. */
  aoTocar?: () => void;
  className?: string;
}

/**
 * Palco da caixa de presente. O 3D carrega sob demanda; enquanto isso (ou sem
 * WebGL) aparece a caixa desenhada em CSS, com as mesmas cores.
 */
export function CaixaPresente({
  modo,
  aberta = false,
  parada = false,
  pulo = 0,
  aoTocar,
  className = "",
}: Props) {
  const telaRef = useRef<HTMLDivElement>(null);
  const cenaRef = useRef<CenaCaixa | null>(null);
  const abertaRef = useRef(aberta);
  const paradaRef = useRef(parada);
  const [pronta, setPronta] = useState(false);
  const pausadas = useAnimacoesPausadas();

  useEffect(() => {
    abertaRef.current = aberta;
    if (aberta) cenaRef.current?.abrir();
  }, [aberta]);

  useEffect(() => {
    paradaRef.current = parada;
    cenaRef.current?.definirParada(parada);
  }, [parada]);

  useEffect(() => {
    if (pulo > 0) cenaRef.current?.pular();
  }, [pulo]);

  useEffect(() => {
    cenaRef.current?.definirPausa(pausadas);
  }, [pausadas]);

  useEffect(() => {
    const tela = telaRef.current;
    if (!tela) return;
    let cancelado = false;
    let cena: CenaCaixa | null = null;

    import("@/lib/cena/caixa")
      .then(({ CenaCaixa: Cena, suportaWebgl }) => {
        if (cancelado || !suportaWebgl()) return;
        cena = new Cena(tela, {
          modo,
          aberta: abertaRef.current,
          parada: paradaRef.current,
          pausada: animacoesPausadas(),
          aoPronto: () => setPronta(true),
        });
        cenaRef.current = cena;
      })
      .catch(() => {
        // Sem o 3D, a caixa em CSS continua no lugar.
      });

    return () => {
      cancelado = true;
      cena?.destruir();
      cenaRef.current = null;
    };
  }, [modo]);

  return (
    <div
      aria-hidden="true"
      data-pronta={pronta}
      onClick={aoTocar}
      className={`palco relative ${aoTocar ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="caixa-css" data-aberta={aberta}>
        <div className="caixa-css__base" />
        <div className="caixa-css__tampa">
          <div className="caixa-css__laco" />
        </div>
      </div>
      <div ref={telaRef} className="absolute inset-0" />
    </div>
  );
}
