import {
  embaralhar,
  MAXIMO_PARTICIPANTES,
  Par,
  sortear,
  SorteioImpossivelError,
  SorteioInvalidoError,
} from './sorteio.js';

/** Gerador pseudoaleatório com semente (mulberry32): deixa os testes reprodutíveis. */
function aleatorioComSemente(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AMIGOS = ['Ana', 'Bruno', 'Carla', 'Davi', 'Elisa', 'Fábio'];
const RODADAS = 200;

function quemRecebeDe(pares: Par[], nome: string): string {
  const par = pares.find((p) => p.quemDa === nome);
  if (!par) throw new Error(`${nome} ficou sem par`);
  return par.quemRecebe;
}

describe('sortear', () => {
  it('ninguém tira a si mesmo', () => {
    for (let semente = 0; semente < RODADAS; semente++) {
      const pares = sortear(AMIGOS, [], aleatorioComSemente(semente));
      for (const par of pares) {
        expect(par.quemRecebe).not.toBe(par.quemDa);
      }
    }
  });

  it('todo mundo dá e recebe exatamente um presente', () => {
    for (let semente = 0; semente < RODADAS; semente++) {
      const pares = sortear(AMIGOS, [], aleatorioComSemente(semente));

      expect(pares.map((p) => p.quemDa)).toEqual(AMIGOS);
      expect(new Set(pares.map((p) => p.quemRecebe))).toEqual(new Set(AMIGOS));
    }
  });

  it('respeita as restrições nos dois sentidos', () => {
    const restricoes = [
      ['Ana', 'Bruno'],
      ['Carla', 'Davi'],
    ] as const;

    for (let semente = 0; semente < RODADAS; semente++) {
      const pares = sortear(AMIGOS, restricoes, aleatorioComSemente(semente));

      expect(quemRecebeDe(pares, 'Ana')).not.toBe('Bruno');
      expect(quemRecebeDe(pares, 'Bruno')).not.toBe('Ana');
      expect(quemRecebeDe(pares, 'Carla')).not.toBe('Davi');
      expect(quemRecebeDe(pares, 'Davi')).not.toBe('Carla');
    }
  });

  it('acha o único sorteio possível quando as restrições apertam', () => {
    // Ana só pode tirar Davi e Carla só pode tirar Bruno. Sobra Carla para
    // Bruno e Ana para Davi. Qualquer semente precisa chegar nesse resultado.
    const restricoes = [
      ['Ana', 'Bruno'],
      ['Ana', 'Carla'],
      ['Carla', 'Davi'],
    ] as const;

    for (let semente = 0; semente < 20; semente++) {
      const pares = sortear(
        ['Ana', 'Bruno', 'Carla', 'Davi'],
        restricoes,
        aleatorioComSemente(semente),
      );
      expect(pares).toEqual([
        { quemDa: 'Ana', quemRecebe: 'Davi' },
        { quemDa: 'Bruno', quemRecebe: 'Carla' },
        { quemDa: 'Carla', quemRecebe: 'Bruno' },
        { quemDa: 'Davi', quemRecebe: 'Ana' },
      ]);
    }
  });

  it('avisa quando as restrições tornam o sorteio impossível', () => {
    // Ana está restrita com todos os outros: não tem quem tirar.
    const anaComTodos = [
      ['Ana', 'Bruno'],
      ['Ana', 'Carla'],
      ['Ana', 'Davi'],
    ] as const;
    expect(() =>
      sortear(['Ana', 'Bruno', 'Carla', 'Davi'], anaComTodos),
    ).toThrow(SorteioImpossivelError);

    // Com 3 pessoas e um casal, os dois só poderiam tirar Carla.
    expect(() =>
      sortear(['Ana', 'Bruno', 'Carla'], [['Ana', 'Bruno']]),
    ).toThrow(SorteioImpossivelError);
  });

  it('é reprodutível com a mesma semente e varia com sementes diferentes', () => {
    const primeiro = sortear(AMIGOS, [], aleatorioComSemente(42));
    const repetido = sortear(AMIGOS, [], aleatorioComSemente(42));
    expect(repetido).toEqual(primeiro);

    const resultados = new Set(
      Array.from({ length: 30 }, (_, semente) =>
        JSON.stringify(sortear(AMIGOS, [], aleatorioComSemente(semente))),
      ),
    );
    expect(resultados.size).toBeGreaterThan(1);
  });

  it('limpa espaços extras dos nomes', () => {
    const pares = sortear(['  Ana ', 'Bruno   Lima', 'Carla']);
    expect(pares.map((p) => p.quemDa)).toEqual(['Ana', 'Bruno Lima', 'Carla']);
  });

  describe('dados inválidos', () => {
    it('exige pelo menos 3 participantes', () => {
      expect(() => sortear(['Ana', 'Bruno'])).toThrow(
        'Informe pelo menos 3 participantes.',
      );
    });

    it(`aceita no máximo ${MAXIMO_PARTICIPANTES} participantes`, () => {
      const muitos = Array.from(
        { length: MAXIMO_PARTICIPANTES + 1 },
        (_, i) => `Pessoa ${i}`,
      );
      expect(() => sortear(muitos)).toThrow(SorteioInvalidoError);
    });

    it('recusa nomes repetidos, mesmo com maiúsculas diferentes', () => {
      expect(() => sortear(['Ana', 'Bruno', 'ana'])).toThrow(
        'Participante repetido: "ana".',
      );
    });

    it('recusa participante sem nome', () => {
      expect(() => sortear(['Ana', '   ', 'Carla'])).toThrow(
        'Há um participante sem nome.',
      );
    });

    it('recusa restrição com alguém que não está na lista', () => {
      expect(() => sortear(['Ana', 'Bruno', 'Carla'], [['Ana', 'Zé']])).toThrow(
        'A restrição cita "Zé", que não está na lista de participantes.',
      );
    });

    it('recusa restrição de uma pessoa com ela mesma', () => {
      expect(() =>
        sortear(['Ana', 'Bruno', 'Carla'], [['Ana', 'ana']]),
      ).toThrow(SorteioInvalidoError);
    });
  });
});

describe('embaralhar', () => {
  it('mantém os mesmos itens e não altera a lista original', () => {
    const original = [1, 2, 3, 4, 5];
    const embaralhada = embaralhar(original, aleatorioComSemente(7));

    expect(embaralhada).toHaveLength(original.length);
    expect(new Set(embaralhada)).toEqual(new Set(original));
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });
});
