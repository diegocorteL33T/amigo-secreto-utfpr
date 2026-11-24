/**
 * Fundo 3D leve: flocos de papel caindo devagar atrás da página.
 * Opacidade limitada para o texto por cima manter o contraste (DESIGN.md).
 */

import {
  CircleGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  type WebGLRenderer,
} from "three";
import { criarRenderizador, prefereMenosMovimento } from "./comum";

export { suportaWebgl } from "./comum";

export type TemaFlocos = "claro" | "noite";

interface OpcoesFlocos {
  tema: TemaFlocos;
  /** Animação pausada pelo botão do topo: os flocos ficam parados. */
  pausada: boolean;
  aoPronto: () => void;
}

const CORES: Record<TemaFlocos, string[]> = {
  claro: ["#9a3c4c", "#eaa7b2"],
  noite: ["#ebe0d9", "#eaa7b2"],
};
const OPACIDADE: Record<TemaFlocos, number> = { claro: 0.2, noite: 0.18 };

const DISTANCIA = 10;
const CAMPO_DE_VISAO = 50;
const TANGENTE = Math.tan(((CAMPO_DE_VISAO / 2) * Math.PI) / 180);

interface Floco {
  malha: InstancedMesh;
  indice: number;
  x: number;
  y: number;
  z: number;
  queda: number;
  balanco: number;
  frequencia: number;
  fase: number;
  rx: number;
  ry: number;
  rz: number;
  gx: number;
  gy: number;
  gz: number;
  escala: number;
}

function sortear(minimo: number, maximo: number): number {
  return minimo + Math.random() * (maximo - minimo);
}

export class CenaFlocos {
  private readonly tela = document.createElement("canvas");
  private readonly renderizador: WebGLRenderer;
  private readonly cena = new Scene();
  private readonly camera = new PerspectiveCamera(CAMPO_DE_VISAO, 1, 0.1, 60);
  private readonly flocos: Floco[] = [];
  private readonly malhas: InstancedMesh[];
  private readonly auxiliar = new Object3D();
  private readonly menosMovimento = prefereMenosMovimento();
  private readonly aoPronto: () => void;
  private aspecto = 1;
  private tempo = 0;
  private quadro = 0;
  private ultimoInstante = 0;
  private avisouPronto = false;

  constructor(container: HTMLElement, opcoes: OpcoesFlocos) {
    this.aoPronto = opcoes.aoPronto;
    this.renderizador = criarRenderizador(this.tela, 1);
    container.appendChild(this.tela);
    this.camera.position.z = DISTANCIA;

    const quantidade = window.innerWidth < 768 ? 40 : 90;
    const retangulos = Math.round(quantidade * 0.6);
    const material = new MeshBasicMaterial({
      transparent: true,
      opacity: OPACIDADE[opcoes.tema],
      side: DoubleSide,
      depthWrite: false,
    });
    const papel = new InstancedMesh(
      new PlaneGeometry(0.16, 0.24),
      material,
      retangulos,
    );
    const confete = new InstancedMesh(
      new CircleGeometry(0.1, 16),
      material,
      quantidade - retangulos,
    );
    this.malhas = [papel, confete];

    this.ajustarTamanho();
    const cores = CORES[opcoes.tema];
    const cor = new Color();
    for (const malha of this.malhas) {
      malha.frustumCulled = false;
      for (let i = 0; i < malha.count; i++) {
        malha.setColorAt(i, cor.set(cores[Math.floor(Math.random() * cores.length)]));
        const z = sortear(-4, 3);
        this.flocos.push({
          malha,
          indice: i,
          x: sortear(-1, 1) * this.meiaLargura(z),
          y: sortear(-1, 1) * this.meiaAltura(z),
          z,
          queda: sortear(0.12, 0.32),
          balanco: sortear(0.15, 0.5),
          frequencia: sortear(0.2, 0.5),
          fase: sortear(0, Math.PI * 2),
          rx: sortear(0, Math.PI * 2),
          ry: sortear(0, Math.PI * 2),
          rz: sortear(0, Math.PI * 2),
          gx: sortear(-0.9, 0.9),
          gy: sortear(-0.6, 0.6),
          gz: sortear(-0.9, 0.9),
          escala: sortear(0.7, 1.3),
        });
      }
      this.cena.add(malha);
    }

    window.addEventListener("resize", this.ajustarTamanho);
    if (this.menosMovimento || opcoes.pausada) this.desenhar(0);
    else this.quadro = requestAnimationFrame(this.passo);
  }

  /** Para os flocos onde estão, ou volta a deixá-los cair. */
  definirPausa(pausada: boolean): void {
    if (pausada) {
      cancelAnimationFrame(this.quadro);
      this.quadro = 0;
      return;
    }
    if (this.menosMovimento || this.quadro) return;
    this.ultimoInstante = 0;
    this.quadro = requestAnimationFrame(this.passo);
  }

  destruir(): void {
    cancelAnimationFrame(this.quadro);
    window.removeEventListener("resize", this.ajustarTamanho);
    for (const malha of this.malhas) {
      malha.geometry.dispose();
      malha.dispose();
    }
    (this.malhas[0].material as MeshBasicMaterial).dispose();
    this.renderizador.dispose();
    this.renderizador.forceContextLoss();
    this.tela.remove();
  }

  private meiaAltura(z: number): number {
    return (DISTANCIA - z) * TANGENTE + 0.4;
  }

  private meiaLargura(z: number): number {
    return (DISTANCIA - z) * TANGENTE * this.aspecto + 0.4;
  }

  private readonly passo = (instante: number): void => {
    this.quadro = requestAnimationFrame(this.passo);
    const dt = this.ultimoInstante
      ? Math.min((instante - this.ultimoInstante) / 1000, 1 / 20)
      : 0;
    this.ultimoInstante = instante;
    this.desenhar(dt);
  };

  private desenhar(dt: number): void {
    this.tempo += dt;
    for (const floco of this.flocos) {
      floco.y -= floco.queda * dt;
      floco.x +=
        Math.sin(this.tempo * floco.frequencia + floco.fase) * floco.balanco * dt;
      floco.rx += floco.gx * dt;
      floco.ry += floco.gy * dt;
      floco.rz += floco.gz * dt;
      const limite = this.meiaAltura(floco.z);
      if (floco.y < -limite) {
        floco.y = limite;
        floco.x = sortear(-1, 1) * this.meiaLargura(floco.z);
      }
      this.auxiliar.position.set(floco.x, floco.y, floco.z);
      this.auxiliar.rotation.set(floco.rx, floco.ry, floco.rz);
      this.auxiliar.scale.setScalar(floco.escala);
      this.auxiliar.updateMatrix();
      floco.malha.setMatrixAt(floco.indice, this.auxiliar.matrix);
    }
    for (const malha of this.malhas) malha.instanceMatrix.needsUpdate = true;
    this.renderizador.render(this.cena, this.camera);
    if (!this.avisouPronto) {
      this.avisouPronto = true;
      this.aoPronto();
    }
  }

  private readonly ajustarTamanho = (): void => {
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    this.aspecto = largura / altura;
    this.renderizador.setSize(largura, altura, false);
    this.camera.aspect = this.aspecto;
    this.camera.updateProjectionMatrix();
    // Mudar o tamanho apaga o canvas: redesenha na hora, sem esperar o próximo quadro.
    if (this.flocos.length) this.desenhar(0);
  };
}
