"use client";

import { useEffect, useRef, useState } from "react";
import type { CenaFlocos, TemaFlocos } from "@/lib/cena/flocos";
import { animacoesPausadas, useAnimacoesPausadas } from "@/lib/movimento";

/** Fundo 3D fixo atrás da página. Sem WebGL, o fundo fica liso. */
export function FundoFlocos({ tema }: { tema: TemaFlocos }) {
  const ref = useRef<HTMLDivElement>(null);
  const cenaRef = useRef<CenaFlocos | null>(null);
  const [pronto, setPronto] = useState(false);
  const pausadas = useAnimacoesPausadas();

  useEffect(() => {
    cenaRef.current?.definirPausa(pausadas);
  }, [pausadas]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let cancelado = false;
    let cena: CenaFlocos | null = null;

    import("@/lib/cena/flocos")
      .then(({ CenaFlocos: Cena, suportaWebgl }) => {
        if (cancelado || !suportaWebgl()) return;
        cena = new Cena(container, {
          tema,
          pausada: animacoesPausadas(),
          aoPronto: () => setPronto(true),
        });
        cenaRef.current = cena;
      })
      .catch(() => {
        // Fundo liso.
      });

    return () => {
      cancelado = true;
      cena?.destruir();
      cenaRef.current = null;
    };
  }, [tema]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-pronto={pronto}
      className="fundo-flocos pointer-events-none fixed inset-0 -z-10"
    />
  );
}
