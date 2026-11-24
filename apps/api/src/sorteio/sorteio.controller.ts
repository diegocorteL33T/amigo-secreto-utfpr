import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { SorteioService } from './sorteio.service.js';

@Controller()
export class SorteioController {
  constructor(
    @Inject(SorteioService) private readonly sorteios: SorteioService,
  ) {}

  /** Cria o sorteio e devolve um link (token) para cada participante. */
  @Post('sorteios')
  criar(@Body() corpo: unknown) {
    return this.sorteios.criar(corpo);
  }

  /** Revela, para o dono do link, quem ele tirou. */
  @Get('revelacoes/:token')
  revelar(@Param('token') token: string) {
    return this.sorteios.revelar(token);
  }
}
