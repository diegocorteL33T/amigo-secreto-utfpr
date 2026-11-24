/** Peças compartilhadas pelas cenas 3D (só rodam no navegador). */

import { CanvasTexture, SRGBColorSpace, WebGLRenderer } from "three";

/** Testa se o aparelho tem WebGL e libera o contexto de teste na hora. */
export function suportaWebgl(): boolean {
  try {
    const tela = document.createElement("canvas");
    const contexto = tela.getContext("webgl2") ?? tela.getContext("webgl");
    if (!contexto) return false;
    contexto.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function prefereMenosMovimento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function criarRenderizador(
  tela: HTMLCanvasElement,
  densidadeMaxima: number,
): WebGLRenderer {
  const renderizador = new WebGLRenderer({
    canvas: tela,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderizador.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, densidadeMaxima),
  );
  renderizador.setClearColor(0x000000, 0);
  return renderizador;
}

export function limitar(valor: number, minimo = 0, maximo = 1): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

/** Saída forte (começa rápido, assenta devagar). */
export function suavizarSaida(t: number): number {
  return 1 - (1 - limitar(t)) ** 4;
}

/** Vai e vem, para o que se move na tela. */
export function suavizarVaiVem(t: number): number {
  const x = limitar(t);
  return x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2;
}

/**
 * Mola amortecida descrita como a da Apple: a duração percebida e quanto ela
 * quica (0 = sem quique). Integrada a cada quadro.
 */
export class Mola {
  valor: number;
  alvo: number;
  velocidade = 0;
  private readonly rigidez: number;
  private readonly amortecimento: number;

  constructor(valor: number, duracao: number, quique = 0) {
    this.valor = valor;
    this.alvo = valor;
    this.rigidez = ((2 * Math.PI) / duracao) ** 2;
    this.amortecimento = (4 * Math.PI * (1 - quique)) / duracao;
  }

  avancar(dt: number): void {
    const aceleracao =
      this.rigidez * (this.alvo - this.valor) -
      this.amortecimento * this.velocidade;
    this.velocidade += aceleracao * dt;
    this.valor += this.velocidade * dt;
  }

  fixar(valor: number): void {
    this.valor = valor;
    this.alvo = valor;
    this.velocidade = 0;
  }
}

/** Disco com borda suave, para brilho e sombra de contato. `rgb` = "r,g,b". */
export function texturaRadial(rgb: string): CanvasTexture {
  const tamanho = 128;
  const tela = document.createElement("canvas");
  tela.width = tamanho;
  tela.height = tamanho;
  const contexto = tela.getContext("2d");
  if (contexto) {
    const meio = tamanho / 2;
    const disco = contexto.createRadialGradient(meio, meio, 0, meio, meio, meio);
    disco.addColorStop(0, `rgba(${rgb},1)`);
    disco.addColorStop(0.5, `rgba(${rgb},0.45)`);
    disco.addColorStop(1, `rgba(${rgb},0)`);
    contexto.fillStyle = disco;
    contexto.fillRect(0, 0, tamanho, tamanho);
  }
  const textura = new CanvasTexture(tela);
  textura.colorSpace = SRGBColorSpace;
  return textura;
}
