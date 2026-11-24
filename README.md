# Amigo Secreto

Sorteador de amigo secreto feito para o trabalho **Operação Deploy**, da disciplina Gerência de Configuração e Manutenção de Software (UTFPR, câmpus Cornélio Procópio).

Quem organiza cria o grupo, o app faz o sorteio e gera um link para cada participante. Cada link mostra só quem aquela pessoa tirou. Não há banco de dados: o resultado vai criptografado dentro do próprio link.

**Site publicado:** _o link entra aqui depois do primeiro deploy na `main`._

## Funcionalidades

- **Criar o sorteio:** nome do grupo, de 3 a 100 participantes, valor sugerido e data da troca (opcionais) e restrições do tipo "estas duas pessoas não podem se tirar".
- **Sortear com as regras:** ninguém tira a si mesmo, todo mundo dá e recebe um presente e as restrições valem nos dois sentidos. Se as restrições tornam o sorteio impossível, o app avisa.
- **Link lacrado por pessoa:** o resultado é criptografado com AES-256-GCM, usando a chave `SORTEIO_SECRET`. Um link alterado ou criado com outra chave é recusado.
- **Enviar os links:** copiar o link ou mandar direto pelo WhatsApp, com marcação de quem já recebeu.
- **Revelar:** a pessoa abre o link e vê quem tirou, com uma caixa de presente em 3D (Three.js). As animações podem ser pausadas e ficam paradas quando o sistema pede menos movimento.

## Estrutura

```
apps/
  api/                      API em NestJS: sorteio, lacre dos links e testes
  web/                      site em Next.js: telas de criar e de revelar
.github/workflows/ci.yml    pipeline de CI/CD (GitHub Actions)
```

| Parte | Tecnologias |
| --- | --- |
| API (`apps/api`) | NestJS 12, TypeScript, Vitest, Supertest, oxlint |
| Site (`apps/web`) | Next.js 16, React 19, Tailwind CSS 4, Three.js, ESLint |
| Repositório | npm workspaces, GitHub Actions, Vercel |

O site chama a API pelo próprio domínio (`/api/...`), e o Next.js repassa a chamada para o endereço em `API_URL`. Assim não há CORS e a URL da API fica num lugar só.

## Como rodar

Pré-requisitos: Node.js 24 (versão do `.nvmrc`; o mínimo é 22) e npm.

```bash
git clone https://github.com/diegocorteL33T/amigo-secreto-utfpr.git
cd amigo-secreto-utfpr
npm install
```

Depois, em dois terminais, na raiz do projeto:

```bash
npm run dev:api   # API em http://localhost:3001
npm run dev:web   # site em http://localhost:3000
```

Abra http://localhost:3000, crie um sorteio e abra um dos links gerados.

### Variáveis de ambiente

Para rodar localmente, nenhuma variável é obrigatória. Os modelos estão em `apps/api/.env.example` e `apps/web/.env.example`, sem valores reais.

| Variável | Onde | Para quê | Padrão |
| --- | --- | --- | --- |
| `SORTEIO_SECRET` | API | Chave que lacra os links. Mínimo de 16 caracteres. | Fora de produção, usa uma chave local e avisa no terminal. Em produção, a API não sobe sem ela. |
| `PORT` | API | Porta da API. | `3001` |
| `API_URL` | Site | Endereço da API para onde o Next.js repassa `/api/...`. | `http://localhost:3001` |

O Next.js lê sozinho o arquivo `apps/web/.env.local`, se você criar um a partir do modelo. A API lê as variáveis do ambiente do terminal. Em produção, as duas ficam na Vercel.

## Testes e checagens

| Comando | O que faz |
| --- | --- |
| `npm test` | 36 testes unitários da API: regras do sorteio, validação do pedido, lacre dos links e configuração do segredo. |
| `npm run test:e2e` | 5 testes de ponta a ponta da API (Supertest): `/health`, criar um sorteio e revelar cada link, e os erros 400, 422 e 404. |
| `npm run lint` | oxlint na API e ESLint no site. |
| `npm run typecheck` | TypeScript sem emitir arquivos, na API e no site. |
| `npm run build` | Build de produção da API e do site. |

## Rotas da API

| Método | Rota | O que faz |
| --- | --- | --- |
| `GET` | `/health` | Responde `{ "status": "ok" }` quando a API está no ar. |
| `POST` | `/sorteios` | Faz o sorteio e devolve um token por participante. |
| `GET` | `/revelacoes/:token` | Abre o token e devolve quem o participante tirou. |

Exemplo de corpo para `POST /sorteios`:

```json
{
  "grupo": "Família 2026",
  "valorSugerido": "R$ 50",
  "dataEvento": "2026-12-24",
  "participantes": ["Ana", "Bruno", "Carla", "Davi"],
  "restricoes": [["Ana", "Bruno"]]
}
```

A resposta traz `grupo` e `links` (uma lista de `{ "participante", "token" }`). No site, cada token vira o endereço `/revelar/<token>`. Os erros vêm como `{ "statusCode", "message" }`, com uma destas situações:

- **400:** pedido inválido.
- **422:** as restrições impedem o sorteio.
- **404:** o link é inválido.

## Pipeline de CI/CD

O arquivo `.github/workflows/ci.yml` roda a cada push e pull request para `main` e `develop`. Os jobs rodam nesta ordem:

1. **Qualidade:** `npm run lint` e `npm run typecheck`.
2. **Testes:** `npm test` e `npm run test:e2e`.
3. **Build:** `npm run build`.
4. **Deploy da API**, depois **deploy do site**, na Vercel. Depois de cada deploy, a pipeline acessa o endereço de produção: na API, `/health`; no site, a página inicial e o `/api/health`, que passa pelo site até a API. Se algum não responder, a execução falha.

Cada job só começa se o anterior passou. Se um falha, os seguintes ficam como *skipped* e nada é publicado. O deploy só roda na `main` (push ou execução manual) e é feito pela CLI da Vercel (`vercel pull`, `vercel build` e `vercel deploy --prebuilt --prod`). O deploy automático da Vercel está desligado nos `vercel.json`, então só a pipeline publica.

Os segredos ficam no GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_API` e `VERCEL_PROJECT_ID_WEB`) e as variáveis da aplicação ficam na Vercel. Nenhum deles fica no código.

## Branches e commits

- `main`: versão publicada.
- `develop`: integração.
- Branches de trabalho saem da `develop` e voltam para ela, com o nome `tipo/descricao` (por exemplo `ci/pipeline` e `docs/readme`).
- Os commits seguem o padrão *Conventional Commits*, em português: `tipo(escopo): descricao`.

## Equipe

- Diego Corte
- Thales Kohki Hasegawa
