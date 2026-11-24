import { lerPedidoDeSorteio } from './pedido.js';
import { SorteioInvalidoError } from './sorteio.js';

const BASE = { grupo: 'Turma', participantes: ['Ana', 'Bruno', 'Carla'] };

describe('lerPedidoDeSorteio', () => {
  it('aceita um pedido completo e limpa os textos', () => {
    const pedido = lerPedidoDeSorteio({
      ...BASE,
      grupo: '  Turma   6º período ',
      valorSugerido: 'R$ 30',
      dataEvento: '2026-12-18',
      restricoes: [['Ana', 'Bruno']],
    });

    expect(pedido).toEqual({
      grupo: 'Turma 6º período',
      participantes: ['Ana', 'Bruno', 'Carla'],
      restricoes: [['Ana', 'Bruno']],
      valorSugerido: 'R$ 30',
      dataEvento: '2026-12-18',
    });
  });

  it('trata restrições, valor e data como opcionais', () => {
    expect(lerPedidoDeSorteio({ ...BASE, valorSugerido: '' })).toEqual({
      ...BASE,
      restricoes: [],
    });
  });

  it.each([
    ['corpo que não é objeto', 'texto'],
    ['grupo ausente', { participantes: BASE.participantes }],
    ['grupo em branco', { ...BASE, grupo: '   ' }],
    ['participantes que não são lista', { ...BASE, participantes: 'Ana' }],
    ['participante que não é texto', { ...BASE, participantes: ['Ana', 2] }],
    [
      'restrição com três pessoas',
      { ...BASE, restricoes: [['Ana', 'Bruno', 'Carla']] },
    ],
    ['data em outro formato', { ...BASE, dataEvento: '24/12/2026' }],
    ['data que não existe', { ...BASE, dataEvento: '2026-02-30' }],
    ['grupo longo demais', { ...BASE, grupo: 'x'.repeat(81) }],
  ])('recusa %s', (_caso, corpo) => {
    expect(() => lerPedidoDeSorteio(corpo)).toThrow(SorteioInvalidoError);
  });
});
