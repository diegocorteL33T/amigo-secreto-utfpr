import { Controller, Get } from '@nestjs/common';

/** Rota usada pelo pipeline para conferir se a API publicada está no ar. */
@Controller('health')
export class SaudeController {
  @Get()
  verificar() {
    return { status: 'ok' };
  }
}
