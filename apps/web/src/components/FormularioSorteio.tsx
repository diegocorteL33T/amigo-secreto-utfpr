"use client";

import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown, CircleAlert, X } from "lucide-react";
import {
  criarSorteio,
  ErroDaApi,
  Restricao,
  ResultadoDoSorteio,
} from "@/lib/api";
import { mesmoNome, normalizarNome } from "@/lib/textos";
import { ResultadoSorteio } from "./ResultadoSorteio";

const MINIMO = 3;
/** Espera a página voltar ao topo antes do salto da caixa. */
const ESPERA_DO_SALTO = 450;
const SAIDA_DO_RESULTADO = 150;

interface Erro {
  mensagem: string;
  /** Onde o aviso aparece: perto das restrições (sorteio impossível) ou do botão. */
  local: "restricoes" | "envio";
}

function prefereMenosMovimento(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Alerta({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="t-pequeno flex gap-2 rounded-md bg-danger-bg px-4 py-3 text-danger"
    >
      <CircleAlert
        aria-hidden
        size={18}
        strokeWidth={1.5}
        className="mt-px shrink-0"
      />
      <span>{children}</span>
    </p>
  );
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <p
      className="t-pequeno flex items-center gap-2 text-danger"
      role="status"
    >
      <CircleAlert aria-hidden size={16} strokeWidth={1.5} />
      {children}
    </p>
  );
}

function Selecao({
  rotulo,
  vazio,
  valor,
  opcoes,
  desabilitada,
  selectRef,
  aoMudar,
}: {
  rotulo: string;
  vazio: string;
  valor: string;
  opcoes: string[];
  desabilitada: boolean;
  selectRef?: RefObject<HTMLSelectElement | null>;
  aoMudar: (valor: string) => void;
}) {
  return (
    <div className="relative">
      <select
        ref={selectRef}
        className="campo"
        aria-label={rotulo}
        value={valor}
        disabled={desabilitada}
        onChange={(e) => aoMudar(e.target.value)}
      >
        <option value="">{vazio}</option>
        {opcoes.map((nome) => (
          <option key={nome} value={nome}>
            {nome}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={18}
        strokeWidth={1.5}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function FormularioSorteio({ aoSortear }: { aoSortear?: () => void }) {
  const [grupo, setGrupo] = useState("");
  const [valorSugerido, setValorSugerido] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [pessoaA, setPessoaA] = useState("");
  const [pessoaB, setPessoaB] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [avisoRestricao, setAvisoRestricao] = useState<string | null>(null);
  const [erro, setErro] = useState<Erro | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDoSorteio | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [voltou, setVoltou] = useState(false);

  const campoGrupoRef = useRef<HTMLInputElement>(null);
  const campoParticipanteRef = useRef<HTMLInputElement>(null);
  const botoesRemoverParticipanteRef = useRef<Map<string, HTMLButtonElement>>(
    new Map(),
  );
  const focoParticipanteRef = useRef<
    { tipo: "chip"; nome: string } | { tipo: "campo" } | null
  >(null);
  const primeiraPessoaRef = useRef<HTMLSelectElement>(null);
  const botoesRemoverRestricaoRef = useRef<Map<string, HTMLButtonElement>>(
    new Map(),
  );
  const focoRestricaoRef = useRef<
    { tipo: "item"; chave: string } | { tipo: "select" } | null
  >(null);
  const focarGrupoRef = useRef(false);

  useEffect(() => {
    const alvo = focoParticipanteRef.current;
    if (!alvo) return;
    focoParticipanteRef.current = null;
    if (alvo.tipo === "chip") {
      botoesRemoverParticipanteRef.current.get(alvo.nome)?.focus();
    } else {
      campoParticipanteRef.current?.focus();
    }
  }, [participantes]);

  useEffect(() => {
    const alvo = focoRestricaoRef.current;
    if (!alvo) return;
    focoRestricaoRef.current = null;
    if (alvo.tipo === "item") {
      botoesRemoverRestricaoRef.current.get(alvo.chave)?.focus();
    } else {
      primeiraPessoaRef.current?.focus();
    }
  }, [restricoes]);

  useEffect(() => {
    if (!resultado && focarGrupoRef.current) {
      focarGrupoRef.current = false;
      campoGrupoRef.current?.focus();
    }
  }, [resultado]);

  function limparErroDasRestricoes() {
    if (erro?.local === "restricoes") setErro(null);
  }

  function adicionarParticipante() {
    const nome = normalizarNome(novoNome);
    if (!nome) return;
    if (participantes.some((p) => mesmoNome(p, nome))) {
      setAviso(`"${nome}" já está na lista.`);
      return;
    }
    setParticipantes([...participantes, nome]);
    setNovoNome("");
    setAviso(null);
  }

  function aoDigitarNome(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Enter") {
      evento.preventDefault();
      adicionarParticipante();
    }
  }

  function removerParticipante(nome: string) {
    const indice = participantes.indexOf(nome);
    const proximos = participantes.filter((p) => p !== nome);
    const proximoNome = proximos[indice] ?? proximos[indice - 1] ?? null;
    focoParticipanteRef.current = proximoNome
      ? { tipo: "chip", nome: proximoNome }
      : { tipo: "campo" };

    setParticipantes(proximos);
    setRestricoes(restricoes.filter(([a, b]) => a !== nome && b !== nome));
    if (pessoaA === nome) setPessoaA("");
    if (pessoaB === nome) setPessoaB("");
    if (aviso) setAviso(null);
    if (avisoRestricao) setAvisoRestricao(null);
    limparErroDasRestricoes();
  }

  function mudarPessoaA(valor: string) {
    setPessoaA(valor);
    if (valor && valor === pessoaB) setPessoaB("");
    if (avisoRestricao) setAvisoRestricao(null);
  }

  function mudarPessoaB(valor: string) {
    setPessoaB(valor);
    if (avisoRestricao) setAvisoRestricao(null);
  }

  function adicionarRestricao() {
    if (!pessoaA || !pessoaB || pessoaA === pessoaB) return;
    const repetida = restricoes.some(
      ([a, b]) =>
        (a === pessoaA && b === pessoaB) || (a === pessoaB && b === pessoaA),
    );
    if (repetida) {
      setAvisoRestricao("Essa restrição já está na lista.");
      return;
    }
    setRestricoes([...restricoes, [pessoaA, pessoaB]]);
    setAvisoRestricao(null);
    setPessoaA("");
    setPessoaB("");
  }

  function removerRestricao(a: string, b: string) {
    const indice = restricoes.findIndex(([x, y]) => x === a && y === b);
    const proximas = restricoes.filter(([x, y]) => x !== a || y !== b);
    const proxima = proximas[indice] ?? proximas[indice - 1] ?? null;
    focoRestricaoRef.current = proxima
      ? { tipo: "item", chave: `${proxima[0]}|${proxima[1]}` }
      : { tipo: "select" };

    setRestricoes(proximas);
    if (avisoRestricao) setAvisoRestricao(null);
    limparErroDasRestricoes();
  }

  async function sortear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const sorteio = await criarSorteio({
        grupo,
        valorSugerido: valorSugerido || undefined,
        dataEvento: dataEvento || undefined,
        participantes,
        restricoes,
      });
      setResultado(sorteio);
      window.scrollTo({
        top: 0,
        behavior: prefereMenosMovimento() ? "auto" : "smooth",
      });
      window.setTimeout(() => aoSortear?.(), ESPERA_DO_SALTO);
    } catch (e) {
      if (e instanceof ErroDaApi) {
        setErro({
          mensagem: e.message,
          local: e.status === 422 ? "restricoes" : "envio",
        });
      } else {
        setErro({ mensagem: "Algo deu errado. Tente de novo.", local: "envio" });
      }
    } finally {
      setEnviando(false);
    }
  }

  function recomecar() {
    const concluir = () => {
      focarGrupoRef.current = true;
      setResultado(null);
      setRestricoes([]);
      setParticipantes([]);
      setGrupo("");
      setValorSugerido("");
      setDataEvento("");
      setNovoNome("");
      setPessoaA("");
      setPessoaB("");
      setAviso(null);
      setAvisoRestricao(null);
      setErro(null);
      setSaindo(false);
      setVoltou(true);
    };
    if (prefereMenosMovimento()) {
      concluir();
      return;
    }
    setSaindo(true);
    window.setTimeout(concluir, SAIDA_DO_RESULTADO);
  }

  const nomeDoGrupo = normalizarNome(grupo);
  const faltam = Math.max(0, MINIMO - participantes.length);
  const podeSortear = !enviando && Boolean(nomeDoGrupo) && faltam === 0;
  const rotuloDoBotao = enviando
    ? "Sorteando…"
    : !nomeDoGrupo
      ? "Dê um nome ao grupo"
      : faltam > 0
        ? `Adicione mais ${faltam} ${faltam === 1 ? "pessoa" : "pessoas"}`
        : "Sortear";

  return (
    <div className="entrar mx-auto w-full max-w-[560px] rounded-lg border border-line bg-card p-6 [--atraso:140ms] lg:mx-0 lg:p-8">
      {resultado ? (
        <ResultadoSorteio
          resultado={resultado}
          saindo={saindo}
          aoRecomecar={recomecar}
        />
      ) : (
        <form
          onSubmit={sortear}
          className={`flex flex-col gap-8 ${voltou ? "entrar [animation-duration:260ms]" : ""}`}
        >
          <section aria-labelledby="passo-grupo" className="flex flex-col gap-3">
            <h2 id="passo-grupo" className="t-h3">
              O grupo
            </h2>
            <label className="flex flex-col gap-2">
              <span className="t-pequeno font-medium">Nome do grupo</span>
              <input
                ref={campoGrupoRef}
                className="campo"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                placeholder="Ex.: Família Corte"
                maxLength={80}
                required
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="t-pequeno font-medium">
                  Valor sugerido{" "}
                  <span className="font-normal text-muted">(opcional)</span>
                </span>
                <input
                  className="campo"
                  value={valorSugerido}
                  onChange={(e) => setValorSugerido(e.target.value)}
                  placeholder="Ex.: R$ 50"
                  maxLength={40}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="t-pequeno font-medium">
                  Data da troca{" "}
                  <span className="font-normal text-muted">(opcional)</span>
                </span>
                <input
                  type="date"
                  className="campo"
                  value={dataEvento}
                  onChange={(e) => setDataEvento(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section
            aria-labelledby="passo-participantes"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1">
              <h2 id="passo-participantes" className="t-h3">
                Quem participa
              </h2>
              <p className="t-pequeno text-muted">
                Digite um nome e toque em Adicionar. O sorteio precisa de pelo
                menos {MINIMO} pessoas.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={campoParticipanteRef}
                className="campo"
                value={novoNome}
                onChange={(e) => {
                  setNovoNome(e.target.value);
                  if (aviso) setAviso(null);
                }}
                onKeyDown={aoDigitarNome}
                placeholder="Nome"
                maxLength={60}
                aria-label="Nome do participante"
                enterKeyHint="done"
              />
              <button
                type="button"
                className="botao-secundario h-12 shrink-0"
                onClick={adicionarParticipante}
                disabled={!normalizarNome(novoNome)}
              >
                Adicionar
              </button>
            </div>
            {aviso && <Aviso>{aviso}</Aviso>}
            {participantes.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Participantes">
                {participantes.map((nome) => (
                  <li
                    key={nome}
                    className="flex h-9 max-w-full items-center gap-1 rounded-full bg-surface pl-4 pr-1"
                  >
                    <span className="truncate">{nome}</span>
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) {
                          botoesRemoverParticipanteRef.current.set(nome, el);
                        } else {
                          botoesRemoverParticipanteRef.current.delete(nome);
                        }
                      }}
                      onClick={() => removerParticipante(nome)}
                      aria-label={`Remover ${nome}`}
                      className="relative grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors after:absolute after:-inset-2 hover:bg-(--secondary-hover) hover:text-ink"
                    >
                      <X aria-hidden size={16} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="passo-restricoes"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1">
              <h2 id="passo-restricoes" className="t-h3">
                Quem não pode se tirar{" "}
                <span className="t-pequeno font-sans font-normal text-muted">
                  (opcional)
                </span>
              </h2>
              <p className="t-pequeno text-muted">
                Útil para casais ou para quem mora junto. A regra vale nos dois
                sentidos.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Selecao
                rotulo="Primeira pessoa da restrição"
                vazio="Pessoa"
                valor={pessoaA}
                opcoes={participantes}
                desabilitada={participantes.length < 2}
                selectRef={primeiraPessoaRef}
                aoMudar={mudarPessoaA}
              />
              <Selecao
                rotulo="Segunda pessoa da restrição"
                vazio="Outra pessoa"
                valor={pessoaB}
                opcoes={participantes.filter((nome) => nome !== pessoaA)}
                desabilitada={participantes.length < 2}
                aoMudar={mudarPessoaB}
              />
              <button
                type="button"
                className="botao-secundario h-12"
                onClick={adicionarRestricao}
                disabled={!pessoaA || !pessoaB || pessoaA === pessoaB}
              >
                Adicionar
              </button>
            </div>
            {avisoRestricao && <Aviso>{avisoRestricao}</Aviso>}
            {erro?.local === "restricoes" && <Alerta>{erro.mensagem}</Alerta>}
            {restricoes.length > 0 && (
              <ul
                className="divide-y divide-line border-y border-line"
                aria-label="Restrições"
              >
                {restricoes.map(([a, b]) => (
                  <li
                    key={`${a}|${b}`}
                    className="flex min-h-12 items-center justify-between gap-3"
                  >
                    <span>
                      <strong className="font-medium">{a}</strong> e{" "}
                      <strong className="font-medium">{b}</strong> não se tiram
                    </span>
                    <button
                      type="button"
                      ref={(el) => {
                        const chave = `${a}|${b}`;
                        if (el) botoesRemoverRestricaoRef.current.set(chave, el);
                        else botoesRemoverRestricaoRef.current.delete(chave);
                      }}
                      onClick={() => removerRestricao(a, b)}
                      className="botao-texto t-pequeno shrink-0"
                      aria-label={`Remover a restrição entre ${a} e ${b}`}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col gap-3">
            {erro?.local === "envio" && <Alerta>{erro.mensagem}</Alerta>}
            <button
              type="submit"
              disabled={!podeSortear}
              className="botao-principal w-full"
            >
              {rotuloDoBotao}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
