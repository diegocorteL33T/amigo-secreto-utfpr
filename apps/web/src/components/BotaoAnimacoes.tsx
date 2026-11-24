"use client";

import { Pause, Play } from "lucide-react";
import {
  definirAnimacoesPausadas,
  useAnimacoesPausadas,
} from "@/lib/movimento";

/**
 * Pausa e retoma os flocos e o giro da caixa. Some quando o sistema já pede
 * menos movimento, porque aí as cenas já ficam paradas.
 */
export function BotaoAnimacoes({ className = "" }: { className?: string }) {
  const pausadas = useAnimacoesPausadas();
  const rotulo = pausadas ? "Retomar animações" : "Pausar animações";

  return (
    <button
      type="button"
      onClick={() => definirAnimacoesPausadas(!pausadas)}
      aria-label={rotulo}
      title={rotulo}
      className={`botao-icone motion-reduce:hidden ${className}`}
    >
      {pausadas ? (
        <Play aria-hidden size={20} strokeWidth={1.5} />
      ) : (
        <Pause aria-hidden size={20} strokeWidth={1.5} />
      )}
    </button>
  );
}
