# Site do Amigo Secreto (`apps/web`)

Telas de criar o sorteio e de revelar o amigo secreto, em Next.js 16 com React 19, Tailwind CSS 4 e Three.js.

Como rodar, testar e publicar o projeto inteiro: veja o [README da raiz](../../README.md).

## Comandos

Na raiz do repositório:

```bash
npm run dev:web                    # desenvolvimento em http://localhost:3000
npm run build --workspace web      # build de produção
npm run start --workspace web      # serve o build de produção
npm run lint --workspace web       # ESLint
npm run typecheck --workspace web  # TypeScript
```

O site precisa da API rodando (`npm run dev:api`). As chamadas para `/api/...` são repassadas para `API_URL` (padrão `http://localhost:3001`). O modelo da variável está em `.env.example`.

## Onde está cada coisa

| Caminho | Conteúdo |
| --- | --- |
| `src/app/page.tsx` | Tela de criar o sorteio e ver os links |
| `src/app/revelar/[token]/page.tsx` | Tela de revelação |
| `src/app/not-found.tsx` | Página 404 |
| `src/components/` | Componentes das telas: formulário, resultado, revelação, caixa e flocos em 3D, botão de pausar as animações |
| `src/lib/api.ts` | Chamadas à API |
| `src/lib/cena/` | Cenas 3D em Three.js (caixa de presente e flocos) |
| `DESIGN.md` | Regras visuais: cores, tipografia, espaçamento e movimento |
