import { DadosRevelacao, Lacre, LinkInvalidoError } from './lacre.js';

const SEGREDO = 'segredo-de-teste-com-tamanho-suficiente';

const DADOS: DadosRevelacao = {
  grupo: 'Família Corte',
  participante: 'Ana',
  amigoSecreto: 'Bruno',
  valorSugerido: 'R$ 50',
  dataEvento: '2026-12-24',
};

describe('Lacre', () => {
  it('abre o link e devolve exatamente quem o participante tirou', () => {
    const lacre = new Lacre(SEGREDO);

    expect(lacre.abrir(lacre.lacrar(DADOS))).toEqual(DADOS);
  });

  it('não deixa ler o resultado sem a chave (o nome não aparece no link)', () => {
    const token = new Lacre(SEGREDO).lacrar(DADOS);
    const textoDoLink = Buffer.from(token, 'base64url').toString('latin1');

    expect(token).not.toContain('Bruno');
    expect(textoDoLink).not.toContain('Bruno');
  });

  it('gera links diferentes para os mesmos dados', () => {
    const lacre = new Lacre(SEGREDO);

    expect(lacre.lacrar(DADOS)).not.toBe(lacre.lacrar(DADOS));
  });

  it('recusa um link alterado', () => {
    const lacre = new Lacre(SEGREDO);
    const bytes = Buffer.from(lacre.lacrar(DADOS), 'base64url');
    bytes[bytes.length - 1] ^= 0xff;
    const adulterado = bytes.toString('base64url');

    expect(() => lacre.abrir(adulterado)).toThrow(LinkInvalidoError);
  });

  it('recusa um link criado com outro segredo', () => {
    const token = new Lacre('outro-segredo-de-teste-qualquer').lacrar(DADOS);

    expect(() => new Lacre(SEGREDO).abrir(token)).toThrow(LinkInvalidoError);
  });

  it('recusa lixo no lugar do link', () => {
    const lacre = new Lacre(SEGREDO);

    expect(() => lacre.abrir('abc')).toThrow(LinkInvalidoError);
    expect(() => lacre.abrir('')).toThrow(LinkInvalidoError);
  });

  it('omite os campos opcionais que não foram informados', () => {
    const lacre = new Lacre(SEGREDO);
    const semOpcionais = {
      grupo: 'G',
      participante: 'Ana',
      amigoSecreto: 'Bia',
    };

    expect(lacre.abrir(lacre.lacrar(semOpcionais))).toEqual(semOpcionais);
  });

  it('exige um segredo com pelo menos 16 caracteres', () => {
    expect(() => new Lacre('curto')).toThrow('pelo menos 16 caracteres');
  });
});
