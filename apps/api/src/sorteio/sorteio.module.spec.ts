import { Logger } from '@nestjs/common';
import { Lacre } from '../revelacao/lacre.js';
import { criarLacre } from './sorteio.module.js';

describe('criarLacre', () => {
  it('usa o SORTEIO_SECRET configurado', () => {
    const dados = { grupo: 'G', participante: 'Ana', amigoSecreto: 'Bia' };
    const segredo = 'segredo-configurado-no-ambiente';

    const token = criarLacre({ SORTEIO_SECRET: segredo }).lacrar(dados);

    expect(new Lacre(segredo).abrir(token)).toEqual(dados);
  });

  it('impede a API de subir em produção sem o segredo', () => {
    expect(() => criarLacre({ NODE_ENV: 'production' })).toThrow(
      'SORTEIO_SECRET',
    );
  });

  it('usa um segredo local fora de produção, com aviso', () => {
    const aviso = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});

    expect(criarLacre({ NODE_ENV: 'development' })).toBeInstanceOf(Lacre);
    expect(aviso).toHaveBeenCalledOnce();

    aviso.mockRestore();
  });
});
