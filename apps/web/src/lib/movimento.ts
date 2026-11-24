import { useSyncExternalStore } from "react";

/**
 * Pausa das animações contínuas (flocos de fundo e giro da caixa), pedida pelo
 * botão do topo. Atende à WCAG 2.2.2: movimento que começa sozinho e dura mais
 * de 5 segundos precisa de um jeito de pausar. A escolha fica no navegador.
 */
const CHAVE = "amigo-secreto:animacoes";
const ouvintes = new Set<() => void>();
let pausadas: boolean | null = null;

export function animacoesPausadas(): boolean {
  if (pausadas === null) {
    try {
      pausadas = window.localStorage.getItem(CHAVE) === "pausadas";
    } catch {
      pausadas = false;
    }
  }
  return pausadas;
}

export function definirAnimacoesPausadas(valor: boolean): void {
  pausadas = valor;
  try {
    if (valor) window.localStorage.setItem(CHAVE, "pausadas");
    else window.localStorage.removeItem(CHAVE);
  } catch {
    // Sem armazenamento: a escolha vale só enquanto a página estiver aberta.
  }
  for (const ouvinte of ouvintes) ouvinte();
}

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function useAnimacoesPausadas(): boolean {
  return useSyncExternalStore(assinar, animacoesPausadas, () => false);
}
