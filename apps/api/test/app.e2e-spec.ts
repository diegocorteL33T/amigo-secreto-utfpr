import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

interface RespostaDoSorteio {
  grupo: string;
  links: { participante: string; token: string }[];
}

const PEDIDO = {
  grupo: 'Família Corte',
  valorSugerido: 'R$ 50',
  dataEvento: '2026-12-24',
  participantes: ['Ana', 'Bruno', 'Carla', 'Davi', 'Elisa'],
  restricoes: [['Ana', 'Bruno']],
};

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.SORTEIO_SECRET = 'segredo-dos-testes-e2e-da-api';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health responde que a API está no ar', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('cria o sorteio e cada link revela um amigo secreto válido', async () => {
    const criacao = await request(app.getHttpServer())
      .post('/sorteios')
      .send(PEDIDO)
      .expect(201);
    const sorteio = criacao.body as RespostaDoSorteio;

    expect(sorteio.grupo).toBe('Família Corte');
    expect(sorteio.links.map((l) => l.participante)).toEqual(
      PEDIDO.participantes,
    );

    const revelacoes = await Promise.all(
      sorteio.links.map((link) =>
        request(app.getHttpServer())
          .get(`/revelacoes/${link.token}`)
          .expect(200),
      ),
    );
    const resultados = revelacoes.map(
      (r) => r.body as { participante: string; amigoSecreto: string },
    );

    for (const [i, resultado] of resultados.entries()) {
      expect(resultado).toMatchObject({
        grupo: 'Família Corte',
        participante: PEDIDO.participantes[i],
        valorSugerido: 'R$ 50',
        dataEvento: '2026-12-24',
      });
      expect(resultado.amigoSecreto).not.toBe(resultado.participante);
    }

    const quemFoiTirado = resultados.map((r) => r.amigoSecreto).sort();
    expect(quemFoiTirado).toEqual([...PEDIDO.participantes].sort());

    const ana = resultados.find((r) => r.participante === 'Ana');
    expect(ana?.amigoSecreto).not.toBe('Bruno');
  });

  it('responde 400 com a mensagem quando faltam participantes', () => {
    return request(app.getHttpServer())
      .post('/sorteios')
      .send({ grupo: 'Dupla', participantes: ['Ana', 'Bruno'] })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Informe pelo menos 3 participantes.',
      });
  });

  it('responde 422 quando as restrições impedem o sorteio', () => {
    return request(app.getHttpServer())
      .post('/sorteios')
      .send({
        grupo: 'Trio',
        participantes: ['Ana', 'Bruno', 'Carla'],
        restricoes: [['Ana', 'Bruno']],
      })
      .expect(422);
  });

  it('responde 404 para um link inválido', () => {
    return request(app.getHttpServer())
      .get('/revelacoes/link-que-nao-existe')
      .expect(404);
  });
});
