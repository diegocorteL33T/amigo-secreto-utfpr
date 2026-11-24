/**
 * Caixa de presente 3D: gira devagar no topo da tela de criar e abre na tela
 * de revelação. Movimento descrito no DESIGN.md (seção Movimento).
 */

import {
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
  type WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  Mola,
  criarRenderizador,
  limitar,
  prefereMenosMovimento,
  suavizarSaida,
  suavizarVaiVem,
  texturaRadial,
} from "./comum";

export { suportaWebgl } from "./comum";

export type ModoCaixa = "topo" | "revelacao";

export interface OpcoesCaixa {
  modo: ModoCaixa;
  aberta: boolean;
  parada: boolean;
  /** Animações contínuas pausadas pelo botão do topo. */
  pausada: boolean;
  aoPronto: () => void;
}

const COR_CAIXA = "#9a3c4c";
const COR_FITA = "#f6f0eb";
const COR_LUZ = "#ffe2cf";
const CORES_CONFETE = ["#9a3c4c", "#f6f0eb", "#eaa7b2", "#c76b7b"];

const LADO_BASE = 1.6;
const ALTURA_BASE = 1.15;
const LADO_TAMPA = 1.72;
const ALTURA_TAMPA = 0.32;
const LARGURA_FITA = 0.26;

const SEGUNDOS_POR_VOLTA = 18;
const SEGUNDOS_POR_FLUTUACAO = 4;
const QUANTIDADE_CONFETE = 70;
const GRAVIDADE = 6;
const DURACAO_CONFETE = 3;

interface Enquadramento {
  posicao: Vector3;
  alvo: Vector3;
}

/**
 * Câmera com a caixa fechada e aberta. Na revelação, a câmera sobe e recua
 * junto com a tampa: fechada, a caixa ocupa mais o palco; aberta, a tampa e o
 * laço cabem inteiros no alto.
 */
const ENQUADRAMENTO: Record<
  ModoCaixa,
  { fechada: Enquadramento; aberta: Enquadramento }
> = {
  topo: {
    fechada: { posicao: new Vector3(0, 1.5, 6.4), alvo: new Vector3(0, 0.8, 0) },
    aberta: { posicao: new Vector3(0, 1.5, 6.4), alvo: new Vector3(0, 0.8, 0) },
  },
  revelacao: {
    fechada: {
      posicao: new Vector3(0, 2.59, 6.39),
      alvo: new Vector3(0, 0.95, 0),
    },
    aberta: {
      posicao: new Vector3(0, 3.68, 7.36),
      alvo: new Vector3(0, 1.8, 0),
    },
  },
};

interface Confete {
  posicao: Vector3;
  velocidade: Vector3;
  rotacao: Vector3;
  giro: Vector3;
}

interface Descartavel {
  dispose(): void;
}

export class CenaCaixa {
  private readonly descartaveis: Descartavel[] = [];
  private readonly tela = document.createElement("canvas");
  private readonly renderizador: WebGLRenderer;
  private readonly cena = new Scene();
  private readonly camera = new PerspectiveCamera(30, 1, 0.1, 60);
  private readonly raiz = new Group();
  private readonly tampa = new Group();
  private readonly brilho: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private readonly halo: Sprite;
  private readonly luzInterna = new PointLight(COR_LUZ, 0, 5, 1.5);
  private readonly sombra: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private readonly confete: InstancedMesh;
  private readonly confetes: Confete[] = [];
  private readonly auxiliar = new Object3D();

  private readonly molaTampa = new Mola(0, 0.7, 0.2);
  private readonly molaSalto = new Mola(0, 0.6, 0.3);
  private readonly molaPulo = new Mola(0, 0.45, 0.3);
  private readonly molaInclinacao = new Mola(0, 0.8);
  private readonly molaGiro = new Mola(0, 0.8);
  /** 0 = enquadramento da caixa fechada, 1 = aberta. Sem quique. */
  private readonly molaCamera = new Mola(0, 0.9);
  private readonly alvoCamera = new Vector3();
  private readonly posicaoCamera = new Vector3();
  private aspecto = 1;

  private readonly palco: HTMLElement;
  private readonly modo: ModoCaixa;
  private readonly aoPronto: () => void;
  private readonly menosMovimento = prefereMenosMovimento();
  private readonly observadorTamanho: ResizeObserver;
  private readonly observadorVisao: IntersectionObserver;
  private readonly seguePonteiro: boolean;

  private parada: boolean;
  private pausada: boolean;
  private aberta: boolean;
  private tempo = 0;
  private tempoAbertura = -1;
  private tempoConfete = -1;
  private visivel = true;
  private quadro = 0;
  private ultimoInstante = 0;
  private avisouPronto = false;

  constructor(palco: HTMLElement, opcoes: OpcoesCaixa) {
    this.palco = palco;
    this.modo = opcoes.modo;
    this.parada = opcoes.parada;
    this.pausada = opcoes.pausada;
    this.aberta = opcoes.aberta;
    this.aoPronto = opcoes.aoPronto;

    this.renderizador = criarRenderizador(this.tela, 1.5);
    palco.appendChild(this.tela);

    this.montarLuzes();
    this.montarCaixa();

    this.brilho = new Mesh(
      this.guardar(new PlaneGeometry(LADO_BASE * 0.9, LADO_BASE * 0.9)),
      this.guardar(
        new MeshBasicMaterial({
          color: COR_LUZ,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      ),
    );
    this.brilho.rotation.x = -Math.PI / 2;
    this.brilho.position.y = ALTURA_BASE + 0.015;

    const texturaHalo = this.guardar(texturaRadial("255,226,207"));
    this.halo = new Sprite(
      this.guardar(
        new SpriteMaterial({
          map: texturaHalo,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      ),
    );
    this.halo.position.y = ALTURA_BASE + 0.55;
    this.halo.scale.set(2.8, 2.8, 1);

    this.luzInterna.position.y = ALTURA_BASE + 0.35;
    this.raiz.add(this.brilho, this.halo, this.luzInterna);

    const texturaSombra = this.guardar(texturaRadial("44,35,37"));
    this.sombra = new Mesh(
      this.guardar(new PlaneGeometry(2.8, 2.8)),
      this.guardar(
        new MeshBasicMaterial({
          map: texturaSombra,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
        }),
      ),
    );
    this.sombra.rotation.x = -Math.PI / 2;
    this.sombra.position.y = 0.002;

    this.confete = new InstancedMesh(
      this.guardar(new PlaneGeometry(0.07, 0.11)),
      this.guardar(new MeshBasicMaterial({ side: DoubleSide })),
      QUANTIDADE_CONFETE,
    );
    const cor = new Color();
    for (let i = 0; i < QUANTIDADE_CONFETE; i++) {
      this.confete.setColorAt(i, cor.set(CORES_CONFETE[i % CORES_CONFETE.length]));
    }
    this.confete.frustumCulled = false;
    this.confete.visible = false;

    this.cena.add(this.raiz, this.sombra, this.confete);

    if (this.aberta) {
      this.molaTampa.fixar(1);
      this.molaCamera.fixar(1);
      this.definirLuz(1);
    }

    this.seguePonteiro =
      this.modo === "topo" &&
      !this.menosMovimento &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (this.seguePonteiro) {
      window.addEventListener("pointermove", this.aoMoverPonteiro, {
        passive: true,
      });
    }

    this.observadorTamanho = new ResizeObserver(this.ajustarTamanho);
    this.observadorTamanho.observe(palco);
    this.observadorVisao = new IntersectionObserver((entradas) => {
      this.visivel = entradas[0]?.isIntersecting ?? true;
    });
    this.observadorVisao.observe(palco);

    this.ajustarTamanho();
    if (this.menosMovimento) this.desenharParado();
    else this.quadro = requestAnimationFrame(this.passo);
  }

  /** Abre a tampa (uma vez). Com menos movimento, só aparece aberta. */
  abrir(): void {
    if (this.aberta) return;
    this.aberta = true;
    if (this.menosMovimento) {
      this.molaTampa.fixar(1);
      this.molaCamera.fixar(1);
      this.definirLuz(1);
      this.desenharParado();
      return;
    }
    this.tempoAbertura = 0;
  }

  /** Salto curto quando o sorteio termina (só se a caixa estiver à vista). */
  pular(): void {
    if (this.menosMovimento || !this.visivel || this.aberta) return;
    this.molaSalto.velocidade = 3.5;
    this.molaPulo.velocidade = 6;
  }

  definirParada(parada: boolean): void {
    this.parada = parada;
  }

  /** Congela o giro e a flutuação onde estão; abrir e saltar continuam. */
  definirPausa(pausada: boolean): void {
    this.pausada = pausada;
  }

  destruir(): void {
    cancelAnimationFrame(this.quadro);
    this.observadorTamanho.disconnect();
    this.observadorVisao.disconnect();
    if (this.seguePonteiro) {
      window.removeEventListener("pointermove", this.aoMoverPonteiro);
    }
    for (const item of this.descartaveis) item.dispose();
    this.renderizador.dispose();
    this.renderizador.forceContextLoss();
    this.tela.remove();
  }

  private guardar<T extends Descartavel>(item: T): T {
    this.descartaveis.push(item);
    return item;
  }

  private montarLuzes(): void {
    const noite = this.modo === "revelacao";
    this.cena.add(new HemisphereLight("#fff4ec", "#5a2a33", noite ? 0.9 : 1.6));

    const principal = new DirectionalLight("#ffffff", noite ? 2.6 : 2.2);
    principal.position.set(3, 5, 4);
    const preenchimento = new DirectionalLight("#ffe6ea", 0.5);
    preenchimento.position.set(-4, 2, 2);
    this.cena.add(principal, preenchimento);

    if (noite) {
      const contraluz = new DirectionalLight("#eaa7b2", 1.4);
      contraluz.position.set(-2, 3, -5);
      this.cena.add(contraluz);
    }
  }

  private montarCaixa(): void {
    const papel = this.guardar(
      new MeshStandardMaterial({ color: COR_CAIXA, roughness: 0.6, metalness: 0 }),
    );
    const fita = this.guardar(
      new MeshStandardMaterial({ color: COR_FITA, roughness: 0.38, metalness: 0 }),
    );

    const base = new Mesh(
      this.guardar(
        new RoundedBoxGeometry(LADO_BASE, ALTURA_BASE, LADO_BASE, 4, 0.07),
      ),
      papel,
    );
    base.position.y = ALTURA_BASE / 2;
    this.raiz.add(base);

    const alturaFitaBase = ALTURA_BASE + 0.01;
    for (const geometria of [
      new BoxGeometry(LADO_BASE + 0.02, alturaFitaBase, LARGURA_FITA),
      new BoxGeometry(LARGURA_FITA, alturaFitaBase, LADO_BASE + 0.02),
    ]) {
      const faixa = new Mesh(this.guardar(geometria), fita);
      faixa.position.y = alturaFitaBase / 2;
      this.raiz.add(faixa);
    }

    const corpoTampa = new Mesh(
      this.guardar(
        new RoundedBoxGeometry(LADO_TAMPA, ALTURA_TAMPA, LADO_TAMPA, 4, 0.06),
      ),
      papel,
    );
    corpoTampa.position.y = ALTURA_TAMPA / 2;
    this.tampa.add(corpoTampa);

    const alturaFitaTampa = ALTURA_TAMPA + 0.01;
    for (const geometria of [
      new BoxGeometry(LADO_TAMPA + 0.02, alturaFitaTampa, LARGURA_FITA),
      new BoxGeometry(LARGURA_FITA, alturaFitaTampa, LADO_TAMPA + 0.02),
    ]) {
      const faixa = new Mesh(this.guardar(geometria), fita);
      faixa.position.y = ALTURA_TAMPA / 2;
      this.tampa.add(faixa);
    }

    const laco = new Group();
    laco.position.y = ALTURA_TAMPA;
    const alca = this.guardar(new TorusGeometry(0.2, 0.06, 12, 36));
    for (const lado of [-1, 1]) {
      const volta = new Mesh(alca, fita);
      volta.position.set(lado * 0.2, 0.15, 0);
      volta.rotation.set(0, lado * 0.3, -lado * 0.5);
      volta.scale.set(1.25, 0.85, 1);
      laco.add(volta);
    }
    const no = new Mesh(this.guardar(new SphereGeometry(0.09, 16, 12)), fita);
    no.position.y = 0.07;
    no.scale.set(1.2, 0.9, 1.1);
    laco.add(no);
    this.tampa.add(laco);

    this.tampa.position.y = ALTURA_BASE;
    this.raiz.add(this.tampa);
  }

  private readonly passo = (instante: number): void => {
    this.quadro = requestAnimationFrame(this.passo);
    const dt = this.ultimoInstante
      ? Math.min((instante - this.ultimoInstante) / 1000, 1 / 20)
      : 0;
    this.ultimoInstante = instante;
    if (!this.visivel) return;
    this.atualizar(dt);
    // Pausada e sem nada se mexendo: não redesenha (poupa bateria).
    if (this.pausada && this.emRepouso()) return;
    this.desenhar();
  };

  private emRepouso(): boolean {
    const molas = [
      this.molaInclinacao,
      this.molaGiro,
      this.molaSalto,
      this.molaPulo,
      this.molaTampa,
      this.molaCamera,
    ];
    return (
      this.tempoAbertura < 0 &&
      !this.confete.visible &&
      molas.every(
        (mola) =>
          Math.abs(mola.velocidade) < 1e-4 &&
          Math.abs(mola.alvo - mola.valor) < 1e-4,
      )
    );
  }

  private atualizar(dt: number): void {
    const mexer = !this.menosMovimento && !this.parada && !this.pausada;
    if (mexer) this.tempo += dt;
    const t = this.tempo;

    for (const mola of [
      this.molaInclinacao,
      this.molaGiro,
      this.molaSalto,
      this.molaPulo,
      this.molaTampa,
      this.molaCamera,
    ]) {
      mola.avancar(dt);
    }
    this.posicionarCamera();

    const giroBase =
      this.modo === "topo"
        ? -0.6 + (t * 2 * Math.PI) / SEGUNDOS_POR_VOLTA
        : 0.62 + Math.sin(t * 0.45) * 0.2;
    this.raiz.rotation.set(this.molaInclinacao.valor, giroBase + this.molaGiro.valor, 0);

    const flutuacao =
      0.06 +
      (mexer ? Math.sin((t * 2 * Math.PI) / SEGUNDOS_POR_FLUTUACAO) * 0.05 : 0);
    const altura = flutuacao + Math.max(0, this.molaSalto.valor);
    this.raiz.position.y = altura;
    const afastamento = Math.min(altura, 1);
    this.sombra.material.opacity =
      (this.modo === "revelacao" ? 0.55 : 0.3) * (1 - afastamento * 0.7);
    this.sombra.scale.setScalar(1 - afastamento * 0.3);

    let escala = 1;
    if (this.tempoAbertura >= 0) {
      this.tempoAbertura += dt;
      const ta = this.tempoAbertura;
      if (ta < 0.12) escala = 1 - 0.04 * suavizarVaiVem(ta / 0.12);
      else if (ta < 0.32) escala = 0.96 + 0.04 * suavizarSaida((ta - 0.12) / 0.2);
      if (ta >= 0.12) {
        this.molaTampa.alvo = 1;
        this.molaCamera.alvo = 1;
      }
      this.definirLuz(suavizarSaida(limitar((ta - 0.15) / 0.35)));
      if (ta >= 0.18 && this.tempoConfete < 0) this.lancarConfete();
      if (ta > 2) this.tempoAbertura = -1;
    }
    this.raiz.scale.setScalar(escala);

    const abertura = Math.max(0, this.molaTampa.valor);
    const pulo = Math.max(0, this.molaPulo.valor);
    this.tampa.position.set(
      abertura * 0.22,
      ALTURA_BASE + abertura * 1.35 + pulo,
      -abertura * 0.08,
    );
    this.tampa.rotation.set(-abertura * 0.5, 0, abertura * 0.28 + pulo * 0.3);

    this.atualizarConfete(dt);
  }

  private definirLuz(intensidade: number): void {
    this.brilho.material.opacity = intensidade;
    (this.halo.material as SpriteMaterial).opacity = intensidade * 0.8;
    this.luzInterna.intensity = intensidade * 5;
  }

  private lancarConfete(): void {
    this.tempoConfete = 0;
    const origemY = this.raiz.position.y + ALTURA_BASE;
    this.confetes.length = 0;
    for (let i = 0; i < QUANTIDADE_CONFETE; i++) {
      const angulo = Math.random() * Math.PI * 2;
      const espalhar = 0.6 + Math.random() * 1.6;
      this.confetes.push({
        posicao: new Vector3(
          (Math.random() - 0.5) * 0.9,
          origemY,
          (Math.random() - 0.5) * 0.9,
        ),
        velocidade: new Vector3(
          Math.cos(angulo) * espalhar,
          3.2 + Math.random() * 2.6,
          Math.sin(angulo) * espalhar,
        ),
        rotacao: new Vector3(
          Math.random() * 6,
          Math.random() * 6,
          Math.random() * 6,
        ),
        giro: new Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14,
        ),
      });
    }
    this.confete.visible = true;
  }

  private atualizarConfete(dt: number): void {
    if (!this.confete.visible) return;
    this.tempoConfete += dt;
    if (this.tempoConfete > DURACAO_CONFETE) {
      this.confete.visible = false;
      return;
    }
    const arrasto = 1 - 1.2 * dt;
    this.confetes.forEach((c, i) => {
      c.velocidade.y = Math.max(c.velocidade.y - GRAVIDADE * dt, -1.6);
      c.velocidade.x *= arrasto;
      c.velocidade.z *= arrasto;
      c.posicao.addScaledVector(c.velocidade, dt);
      c.rotacao.addScaledVector(c.giro, dt);
      this.auxiliar.position.copy(c.posicao);
      this.auxiliar.rotation.set(c.rotacao.x, c.rotacao.y, c.rotacao.z);
      this.auxiliar.updateMatrix();
      this.confete.setMatrixAt(i, this.auxiliar.matrix);
    });
    this.confete.instanceMatrix.needsUpdate = true;
  }

  private readonly aoMoverPonteiro = (evento: PointerEvent): void => {
    const x = (evento.clientX / window.innerWidth) * 2 - 1;
    const y = (evento.clientY / window.innerHeight) * 2 - 1;
    this.molaGiro.alvo = x * 0.4;
    this.molaInclinacao.alvo = y * 0.12;
  };

  private readonly ajustarTamanho = (): void => {
    const largura = this.palco.clientWidth;
    const altura = this.palco.clientHeight;
    if (!largura || !altura) return;
    this.renderizador.setSize(largura, altura, false);
    this.aspecto = largura / altura;
    this.camera.aspect = this.aspecto;
    this.camera.updateProjectionMatrix();
    // Mudar o tamanho apaga o canvas: redesenha na hora, sem esperar o próximo quadro.
    this.desenharParado();
  };

  /** Mistura os dois enquadramentos e recua a câmera em palcos estreitos. */
  private posicionarCamera(): void {
    const { fechada, aberta } = ENQUADRAMENTO[this.modo];
    const mistura = limitar(this.molaCamera.valor);
    this.alvoCamera.lerpVectors(fechada.alvo, aberta.alvo, mistura);
    this.posicaoCamera.lerpVectors(fechada.posicao, aberta.posicao, mistura);
    const afastar = Math.max(1, 0.95 / this.aspecto);
    this.camera.position
      .copy(this.posicaoCamera)
      .sub(this.alvoCamera)
      .multiplyScalar(afastar)
      .add(this.alvoCamera);
    this.camera.lookAt(this.alvoCamera);
  }

  private desenharParado(): void {
    this.atualizar(0);
    this.desenhar();
  }

  private desenhar(): void {
    this.renderizador.render(this.cena, this.camera);
    if (!this.avisouPronto) {
      this.avisouPronto = true;
      this.aoPronto();
    }
  }
}
