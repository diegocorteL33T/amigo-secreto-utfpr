import { Logger, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Lacre } from '../revelacao/lacre.js';
import { ErrosDeNegocioFilter } from './erros.filter.js';
import { SorteioController } from './sorteio.controller.js';
import { SorteioService } from './sorteio.service.js';

/** Usado só quando SORTEIO_SECRET não existe fora de produção. */
export const SEGREDO_LOCAL = 'segredo-local-so-para-desenvolvimento';

export function criarLacre(env: NodeJS.ProcessEnv = process.env): Lacre {
  const segredo = env.SORTEIO_SECRET;
  if (segredo) return new Lacre(segredo);

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'Defina a variável de ambiente SORTEIO_SECRET para lacrar os links.',
    );
  }
  new Logger('Lacre').warn(
    'SORTEIO_SECRET não definida: usando um segredo local, só para desenvolvimento.',
  );
  return new Lacre(SEGREDO_LOCAL);
}

@Module({
  controllers: [SorteioController],
  providers: [
    SorteioService,
    { provide: Lacre, useFactory: () => criarLacre() },
    { provide: APP_FILTER, useClass: ErrosDeNegocioFilter },
  ],
})
export class SorteioModule {}
