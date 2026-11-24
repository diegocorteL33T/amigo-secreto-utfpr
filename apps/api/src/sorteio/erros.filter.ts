import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { LinkInvalidoError } from '../revelacao/lacre.js';
import { SorteioImpossivelError, SorteioInvalidoError } from './sorteio.js';

type ErroDeNegocio =
  SorteioInvalidoError | SorteioImpossivelError | LinkInvalidoError;

/** Converte os erros de negócio em respostas HTTP com a mensagem em português. */
@Catch(SorteioInvalidoError, SorteioImpossivelError, LinkInvalidoError)
export class ErrosDeNegocioFilter implements ExceptionFilter<ErroDeNegocio> {
  catch(erro: ErroDeNegocio, host: ArgumentsHost) {
    const status =
      erro instanceof SorteioImpossivelError
        ? HttpStatus.UNPROCESSABLE_ENTITY
        : erro instanceof LinkInvalidoError
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, message: erro.message });
  }
}
