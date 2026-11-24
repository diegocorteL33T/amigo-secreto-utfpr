/**
 * Regra de negócio do sorteio, sem dependência do Nest.
 *
 * O sorteio é tratado como um emparelhamento: cada participante (quem dá)
 * precisa ficar com exatamente um participante (quem recebe), sem tirar a si
 * mesmo e sem tirar quem está numa restrição com ele. O emparelhamento é
 * encontrado com o algoritmo de Kuhn (caminhos aumentantes), que sempre acha
 * uma solução quando ela existe e avisa quando não existe.
 */

export interface Par {
  quemDa: string;
  quemRecebe: string;
}

/** Duas pessoas que não podem se tirar (nos dois sentidos), como um casal. */
export type Restricao = readonly [string, string];

export const MINIMO_PARTICIPANTES = 3;
export const MAXIMO_PARTICIPANTES = 100;
export const TAMANHO_MAXIMO_NOME = 60;

/** Entrada inválida: o problema está nos dados enviados. */
export class SorteioInvalidoError extends Error {
  override name = 'SorteioInvalidoError';
}

/** Entrada válida, mas as restrições não deixam nenhum sorteio possível. */
export class SorteioImpossivelError extends Error {
  override name = 'SorteioImpossivelError';
}

/** Tira espaços das pontas e junta espaços repetidos. */
export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, ' ');
}

function chaveDoNome(nome: string): string {
  return normalizarNome(nome).toLocaleLowerCase('pt-BR');
}

/** Fisher-Yates: embaralha uma cópia usando a fonte de aleatoriedade dada. */
export function embaralhar<T>(
  itens: readonly T[],
  aleatorio: () => number,
): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function validarParticipantes(nomes: string[]): void {
  if (nomes.length < MINIMO_PARTICIPANTES) {
    throw new SorteioInvalidoError(
      `Informe pelo menos ${MINIMO_PARTICIPANTES} participantes.`,
    );
  }
  if (nomes.length > MAXIMO_PARTICIPANTES) {
    throw new SorteioInvalidoError(
      `O sorteio aceita no máximo ${MAXIMO_PARTICIPANTES} participantes.`,
    );
  }

  const vistos = new Set<string>();
  for (const nome of nomes) {
    if (nome === '') {
      throw new SorteioInvalidoError('Há um participante sem nome.');
    }
    if (nome.length > TAMANHO_MAXIMO_NOME) {
      throw new SorteioInvalidoError(
        `O nome "${nome.slice(0, 20)}..." passa de ${TAMANHO_MAXIMO_NOME} caracteres.`,
      );
    }
    const chave = chaveDoNome(nome);
    if (vistos.has(chave)) {
      throw new SorteioInvalidoError(`Participante repetido: "${nome}".`);
    }
    vistos.add(chave);
  }
}

/** Monta, para cada participante, o conjunto de índices que ele não pode tirar. */
function montarProibicoes(
  nomes: string[],
  restricoes: readonly Restricao[],
): Set<number>[] {
  const indicePorChave = new Map(
    nomes.map((nome, i) => [chaveDoNome(nome), i]),
  );
  const indiceDe = (nome: string): number => {
    const indice = indicePorChave.get(chaveDoNome(nome));
    if (indice === undefined) {
      throw new SorteioInvalidoError(
        `A restrição cita "${normalizarNome(nome)}", que não está na lista de participantes.`,
      );
    }
    return indice;
  };

  // Começa sem proibições; as restrições do grupo entram abaixo.
  const proibidos = nomes.map(() => new Set<number>());

  for (const [a, b] of restricoes) {
    const ia = indiceDe(a);
    const ib = indiceDe(b);
    if (ia === ib) {
      throw new SorteioInvalidoError(
        `Uma restrição precisa de duas pessoas diferentes ("${normalizarNome(a)}").`,
      );
    }
    proibidos[ia].add(ib);
    proibidos[ib].add(ia);
  }

  return proibidos;
}

/**
 * Sorteia o amigo secreto.
 *
 * @param participantes nomes dos participantes (ordem livre)
 * @param restricoes pares que não podem se tirar
 * @param aleatorio fonte de aleatoriedade entre 0 e 1 (os testes passam uma fixa)
 * @returns um par por participante, na mesma ordem da lista recebida
 */
export function sortear(
  participantes: readonly string[],
  restricoes: readonly Restricao[] = [],
  aleatorio: () => number = Math.random,
): Par[] {
  const nomes = participantes.map(normalizarNome);
  validarParticipantes(nomes);
  const proibidos = montarProibicoes(nomes, restricoes);

  const indices = nomes.map((_, i) => i);
  const candidatos = indices.map((i) =>
    embaralhar(
      indices.filter((j) => !proibidos[i].has(j)),
      aleatorio,
    ),
  );

  // donoDoPresente[j] = índice de quem tirou j (-1 enquanto ninguém tirou).
  const donoDoPresente: number[] = Array.from(
    { length: nomes.length },
    () => -1,
  );

  const tentarEncaixar = (quemDa: number, visitados: boolean[]): boolean => {
    for (const quemRecebe of candidatos[quemDa]) {
      if (visitados[quemRecebe]) continue;
      visitados[quemRecebe] = true;
      const donoAtual = donoDoPresente[quemRecebe];
      if (donoAtual === -1 || tentarEncaixar(donoAtual, visitados)) {
        donoDoPresente[quemRecebe] = quemDa;
        return true;
      }
    }
    return false;
  };

  for (const quemDa of embaralhar(indices, aleatorio)) {
    const visitados: boolean[] = Array.from(
      { length: nomes.length },
      () => false,
    );
    if (!tentarEncaixar(quemDa, visitados)) {
      throw new SorteioImpossivelError(
        'Não existe sorteio possível com essas restrições. Remova alguma restrição e tente de novo.',
      );
    }
  }

  const recebePorQuemDa: number[] = [];
  donoDoPresente.forEach((quemDa, quemRecebe) => {
    recebePorQuemDa[quemDa] = quemRecebe;
  });

  return nomes.map((nome, i) => ({
    quemDa: nome,
    quemRecebe: nomes[recebePorQuemDa[i]],
  }));
}
