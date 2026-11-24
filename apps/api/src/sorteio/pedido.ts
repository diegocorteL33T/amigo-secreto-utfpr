import { normalizarNome, Restricao, SorteioInvalidoError } from './sorteio.js';

/** Dados que o front envia para criar um sorteio, já conferidos. */
export interface PedidoDeSorteio {
  grupo: string;
  valorSugerido?: string;
  dataEvento?: string;
  participantes: string[];
  restricoes: Restricao[];
}

export const TAMANHO_MAXIMO_GRUPO = 80;
export const TAMANHO_MAXIMO_VALOR = 40;

function textoObrigatorio(
  valor: unknown,
  campo: string,
  maximo: number,
): string {
  if (typeof valor !== 'string' || normalizarNome(valor) === '') {
    throw new SorteioInvalidoError(`Informe o ${campo}.`);
  }
  const texto = normalizarNome(valor);
  if (texto.length > maximo) {
    throw new SorteioInvalidoError(
      `O ${campo} pode ter no máximo ${maximo} caracteres.`,
    );
  }
  return texto;
}

function textoOpcional(
  valor: unknown,
  campo: string,
  maximo: number,
): string | undefined {
  if (valor === undefined || valor === null || valor === '') return undefined;
  return textoObrigatorio(valor, campo, maximo);
}

function dataOpcional(valor: unknown): string | undefined {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const ehDataValida =
    typeof valor === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    new Date(`${valor}T00:00:00Z`).toISOString().startsWith(valor);
  if (!ehDataValida) {
    throw new SorteioInvalidoError(
      'A data da troca de presentes deve estar no formato AAAA-MM-DD.',
    );
  }
  return valor;
}

function listaDeParticipantes(valor: unknown): string[] {
  if (!Array.isArray(valor) || !valor.every((p) => typeof p === 'string')) {
    throw new SorteioInvalidoError('Envie a lista de participantes.');
  }
  return valor;
}

function listaDeRestricoes(valor: unknown): Restricao[] {
  if (valor === undefined || valor === null) return [];
  const ehListaDePares =
    Array.isArray(valor) &&
    valor.every(
      (par) =>
        Array.isArray(par) &&
        par.length === 2 &&
        par.every((nome) => typeof nome === 'string'),
    );
  if (!ehListaDePares) {
    throw new SorteioInvalidoError(
      'Cada restrição deve ter exatamente duas pessoas.',
    );
  }
  return valor as Restricao[];
}

/** Confere o corpo da requisição e devolve um pedido com tipos garantidos. */
export function lerPedidoDeSorteio(corpo: unknown): PedidoDeSorteio {
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
    throw new SorteioInvalidoError('Envie os dados do sorteio em JSON.');
  }
  const campos = corpo as Record<string, unknown>;

  const pedido: PedidoDeSorteio = {
    grupo: textoObrigatorio(
      campos.grupo,
      'nome do grupo',
      TAMANHO_MAXIMO_GRUPO,
    ),
    participantes: listaDeParticipantes(campos.participantes),
    restricoes: listaDeRestricoes(campos.restricoes),
  };

  const valorSugerido = textoOpcional(
    campos.valorSugerido,
    'valor sugerido',
    TAMANHO_MAXIMO_VALOR,
  );
  if (valorSugerido) pedido.valorSugerido = valorSugerido;

  const dataEvento = dataOpcional(campos.dataEvento);
  if (dataEvento) pedido.dataEvento = dataEvento;

  return pedido;
}
