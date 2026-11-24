import { Inject, Injectable } from '@nestjs/common';
import { DadosRevelacao, Lacre } from '../revelacao/lacre.js';
import { lerPedidoDeSorteio } from './pedido.js';
import { sortear } from './sorteio.js';

export interface LinkDoParticipante {
  participante: string;
  token: string;
}

export interface ResultadoDoSorteio {
  grupo: string;
  links: LinkDoParticipante[];
}

@Injectable()
export class SorteioService {
  constructor(@Inject(Lacre) private readonly lacre: Lacre) {}

  /** Sorteia e devolve um token lacrado por participante. */
  criar(corpo: unknown): ResultadoDoSorteio {
    const pedido = lerPedidoDeSorteio(corpo);
    const pares = sortear(pedido.participantes, pedido.restricoes);

    return {
      grupo: pedido.grupo,
      links: pares.map((par) => ({
        participante: par.quemDa,
        token: this.lacre.lacrar({
          grupo: pedido.grupo,
          participante: par.quemDa,
          amigoSecreto: par.quemRecebe,
          valorSugerido: pedido.valorSugerido,
          dataEvento: pedido.dataEvento,
        }),
      })),
    };
  }

  /** Abre o token de um participante e mostra quem ele tirou. */
  revelar(token: string): DadosRevelacao {
    return this.lacre.abrir(token);
  }
}
