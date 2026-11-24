import { Module } from '@nestjs/common';
import { SaudeController } from './saude/saude.controller.js';
import { SorteioModule } from './sorteio/sorteio.module.js';

@Module({
  imports: [SorteioModule],
  controllers: [SaudeController],
})
export class AppModule {}
