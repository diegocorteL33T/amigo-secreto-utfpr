"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import {
  criarSorteio,
  ErroDaApi,
  Restricao,
  ResultadoDoSorteio,
} from "@/lib/api";
import { mesmoNome, normalizarNome } from "@/lib/textos";
import { ResultadoSorteio } from "./ResultadoSorteio";

const MINIMO = 3;

const campo =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const botaoSecundario =
  "rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50";

export function FormularioSorteio() {
  const [grupo, setGrupo] = useState("");
  const [valorSugerido, setValorSugerido] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [participantes, setParticipantes] = useState<string[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [pessoaA, setPessoaA] = useState("");
  const [pessoaB, setPessoaB] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDoSorteio | null>(null);

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
    setParticipantes(participantes.filter((p) => p !== nome));
    setRestricoes(restricoes.filter(([a, b]) => a !== nome && b !== nome));
    if (pessoaA === nome) setPessoaA("");
    if (pessoaB === nome) setPessoaB("");
  }

  function adicionarRestricao() {
    if (!pessoaA || !pessoaB || pessoaA === pessoaB) return;
    const repetida = restricoes.some(
      ([a, b]) =>
        (a === pessoaA && b === pessoaB) || (a === pessoaB && b === pessoaA),
    );
    if (!repetida) setRestricoes([...restricoes, [pessoaA, pessoaB]]);
    setPessoaA("");
    setPessoaB("");
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErro(
        e instanceof ErroDaApi ? e.message : "Algo deu errado. Tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function novoSorteio() {
    setResultado(null);
    setRestricoes([]);
    setParticipantes([]);
    setGrupo("");
    setValorSugerido("");
    setDataEvento("");
  }

  if (resultado) {
    return <ResultadoSorteio resultado={resultado} aoRecomecar={novoSorteio} />;
  }

  const faltam = Math.max(0, MINIMO - participantes.length);

  return (
    <form onSubmit={sortear} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">1. O grupo</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Nome do grupo</span>
          <input
            className={campo}
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            placeholder="Ex.: Família Corte, Turma do 6º período"
            maxLength={80}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Valor sugerido <span className="text-muted">(opcional)</span>
            </span>
            <input
              className={campo}
              value={valorSugerido}
              onChange={(e) => setValorSugerido(e.target.value)}
              placeholder="Ex.: R$ 50"
              maxLength={40}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Data da troca <span className="text-muted">(opcional)</span>
            </span>
            <input
              type="date"
              className={campo}
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">2. Quem participa</h2>
          <p className="text-sm text-muted">
            Digite um nome e aperte Enter. São precisos pelo menos {MINIMO}.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            className={campo}
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={aoDigitarNome}
            placeholder="Nome do participante"
            maxLength={60}
            aria-label="Nome do participante"
          />
          <button
            type="button"
            className={botaoSecundario}
            onClick={adicionarParticipante}
            disabled={!normalizarNome(novoNome)}
          >
            Adicionar
          </button>
        </div>
        {aviso && (
          <p className="text-sm text-accent" role="status">
            {aviso}
          </p>
        )}
        {participantes.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Participantes">
            {participantes.map((nome) => (
              <li
                key={nome}
                className="flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm"
              >
                {nome}
                <button
                  type="button"
                  onClick={() => removerParticipante(nome)}
                  className="grid size-6 place-items-center rounded-full text-muted transition hover:bg-accent-soft hover:text-accent"
                  aria-label={`Remover ${nome}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            3. Quem não pode se tirar{" "}
            <span className="text-sm font-normal text-muted">(opcional)</span>
          </h2>
          <p className="text-sm text-muted">
            Útil para casais ou para quem mora junto. A regra vale nos dois
            sentidos.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select
            className={campo}
            value={pessoaA}
            onChange={(e) => setPessoaA(e.target.value)}
            disabled={participantes.length < 2}
            aria-label="Primeira pessoa da restrição"
          >
            <option value="">Escolha uma pessoa</option>
            {participantes.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
          <select
            className={campo}
            value={pessoaB}
            onChange={(e) => setPessoaB(e.target.value)}
            disabled={participantes.length < 2}
            aria-label="Segunda pessoa da restrição"
          >
            <option value="">e outra pessoa</option>
            {participantes
              .filter((nome) => nome !== pessoaA)
              .map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
          </select>
          <button
            type="button"
            className={botaoSecundario}
            onClick={adicionarRestricao}
            disabled={!pessoaA || !pessoaB || pessoaA === pessoaB}
          >
            Adicionar
          </button>
        </div>
        {restricoes.length > 0 && (
          <ul className="flex flex-col gap-2" aria-label="Restrições">
            {restricoes.map(([a, b]) => (
              <li
                key={`${a}|${b}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <span>
                  <strong className="font-medium">{a}</strong> e{" "}
                  <strong className="font-medium">{b}</strong> não se tiram
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setRestricoes(
                      restricoes.filter(([x, y]) => x !== a || y !== b),
                    )
                  }
                  className="text-muted transition hover:text-accent"
                  aria-label={`Remover a restrição entre ${a} e ${b}`}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {erro && (
        <p
          className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent"
          role="alert"
        >
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || faltam > 0 || !normalizarNome(grupo)}
        className="rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enviando
          ? "Sorteando..."
          : faltam > 0
            ? `Adicione mais ${faltam} ${faltam === 1 ? "pessoa" : "pessoas"}`
            : "Sortear"}
      </button>
    </form>
  );
}
