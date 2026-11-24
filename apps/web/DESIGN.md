# DESIGN.md — Amigo Secreto

Fonte única de verdade do visual deste app. **Se uma skill sugerir algo que contradiz este arquivo, este arquivo vence.** Toda mudança de design passa por aqui primeiro.

Referência: direção A "Papel e rosa", sorteada pela Taste (`design-taste-frontend` 2.5.1): paleta `plaster-rose`, par de fontes `funnel`, raio `round`.
Atualizado em: 2026-11-24 (revisado com Impeccable e Taste)

## Princípios
- **Papel de presente:** fundo creme como papel, destaque rosa-vinho como fita. Caloroso e festivo sem o vermelho e verde óbvios do Natal.
- **O presente é o herói:** a caixa 3D é o único objeto em destaque. Todo o resto é calmo: tipografia, superfícies lisas, poucas cores.
- **Revelação é um momento:** a tela do link muda para a "noite" (cores invertidas da paleta) para a caixa brilhar como num palco. É a única tela escura.
- **Rápido no celular:** o formulário aparece e funciona antes do 3D carregar; o 3D é enfeite, nunca bloqueia.
- **Um nível de cartão:** só o formulário e a lista de links ficam num cartão. Nada de cartão dentro de cartão.
- **Evitar:** sombras em cartões, gradientes, roxo/lilás, emojis ou caracteres no lugar de ícones, rótulo pequeno acima de título ("eyebrow"), números de passo (01, 02), texto secundário sobre o 3D.

## Cores
Tema claro único (tela de criar) e tema "noite" fixo (tela de revelação). Sem troca automática por `prefers-color-scheme`. Cada tela declara o seu `color-scheme` (`light` na de criar, `dark` na de revelação) para os controles nativos e a barra de rolagem acompanharem.

### Tela de criar (claro)
| Token | Valor | Função | Contraste |
|---|---|---|---|
| `--bg` | `#f6f0eb` | fundo | — |
| `--surface` | `#ebe0d9` | chips, botão secundário | — |
| `--card` | `#fbf8f5` | campos e cartões | — |
| `--ink` | `#2c2325` | texto e títulos | 13,5:1 no `--bg` |
| `--muted` | `#6a5d5e` | dicas, "(opcional)", rótulos secundários | 5,6:1 no `--bg`, 4,9:1 no `--surface` |
| `--accent` | `#9a3c4c` | botão principal, caixa 3D, foco | 6,0:1 no `--bg` |
| `--accent-hover` | `#843744` | hover do botão principal | branco 8,0:1 |
| `--accent-ink` | `#ffffff` | texto sobre o destaque | 6,7:1 |
| `--line` | `#e0d9d5` | divisórias e borda de cartões (decorativa) | — |
| `--line-strong` | `#cec7c3` | barra de rolagem (decorativa) | — |
| `--line-field` | `#898383` | borda de campos (componente de interface) | 3,3:1 no `--bg` |
| `--success` / `--success-bg` | `#2f6b45` / `#e3eee6` | aviso de sorteio feito, selo "enviado" | 5,3:1 |
| `--danger` / `--danger-bg` | `#8f1d2c` / `#f6dcdc` | alertas de erro | 6,8:1 |

### Tela de revelação (noite)
| Token | Valor | Função | Contraste |
|---|---|---|---|
| `--night-bg` | `#2c2325` | fundo | — |
| `--night-surface` | `#382f31` | faixa de valor e data | — |
| `--night-ink` | `#f6f0eb` | texto, nome revelado, botão | 13,5:1 |
| `--night-muted` | `#a39b99` | rótulos dentro da faixa | 5,6:1 no fundo, 4,8:1 na superfície |
| `--night-rose` | `#eaa7b2` | nome do grupo, destaques em texto | 7,8:1 |
| `--night-line` | `#7b7372` | bordas, barra de rolagem | 3,3:1 |

O rosa `--accent` **nunca** é usado como texto no fundo escuro (2,3:1): no escuro ele aparece só na caixa 3D.

### Cores da cena 3D
Caixa `#9a3c4c` (papel acetinado), fita e laço `#f6f0eb`. Flocos de fundo: na tela clara, `#9a3c4c` e `#eaa7b2` com opacidade **0,2**; na revelação (escura), `#ebe0d9` e `#eaa7b2` com opacidade **0,18**.

### Texto sobre o fundo 3D
Os flocos passam por trás do texto, então o contraste foi medido no pior caso (o floco mais claro ou mais escuro do tema atrás da letra):
- Sobre o fundo 3D, só `--ink` (10:1), `--night-ink` (8,2:1) e `--night-rose` (4,7:1).
- `--muted` e `--night-muted` caem para 4,1:1 e 3,4:1 com um floco atrás. Por isso **só aparecem sobre superfícies sólidas** (cartão do formulário, faixa de valor e data).

## Tipografia
Fontes (Google Fonts via `next/font`, subconjunto `latin`, `display: swap`): **Funnel Display** (títulos) e **Funnel Sans** (texto). Carregar só os pesos usados: Display 400 e 500, Sans 400 e 500. Base 16px.

| Nível | Tamanho | Fonte e peso | Altura de linha | Espaçamento | Uso |
|---|---|---|---|---|---|
| Display | 48 → 88px (`clamp`) | Display 500 | 1,05 | −3% | nome revelado (no escuro) |
| H1 | 40 → 64px | Display 400 | 1,05 | −3% | chamada da tela de criar |
| H2 | 32 → 40px | Display 400 | 1,1 | −2% | "Olá, Ana", "Sorteio feito" |
| H3 | 24px | Display 500 | 1,25 | −1% | passos do formulário |
| Marca | 20px | Display 500 | 1 | −1% | "Amigo Secreto" no topo das duas telas |
| Destaque | 20px | Sans 400 | 1,45 | 0 | texto de apoio do topo |
| Corpo | 16px | Sans 400 | 1,5 (1,55 no escuro) | 0 | texto, campos |
| Pequeno | 14px | Sans 400/500 | 1,45 | 0 | dicas, rótulos (500), selos |

- Do corpo para cima, degraus de pelo menos 1,2× entre níveis vizinhos; sem 13px nem 18px. Pequeno (14) e Corpo (16) ficam mais perto e por isso se separam também pelo peso e pela cor.
- Títulos com `text-wrap: balance`; texto corrido com `text-wrap: pretty` e no máximo 60 caracteres por linha.
- Altura de linha mínima de 1,05 nos títulos: nomes em português têm acento em maiúscula ("Ângela", "Érica") e 1,0 corta o acento quando o nome quebra em duas linhas.
- **Nome revelado:** `overflow-wrap: anywhere` (um nome pode ter até 60 caracteres); acima de 18 caracteres, usa o tamanho do H1.
- No escuro, o texto claro ganha um passo de peso no Display (500) e um pouco mais de altura de linha no corpo.

## Espaçamento
Base de **8px** (4px para ajustes finos): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Margem lateral: 16px (celular), 32px (tablet), 48px (desktop). Largura máxima: 1200px.
- Formulário: 32px acima de cada passo e 12px abaixo do título do passo; 12px entre campos; 8px entre rótulo e campo. Sempre mais espaço acima de um título do que abaixo dele.
- Alturas: campos 48px, botão principal 52px, botões secundários 44px (48px quando ficam ao lado de um campo, para alinhar com ele). O chip visível tem 36px; a área de toque do "remover" é 44px.

## Raios e sombras
- Raios (escala "round"): `--r-sm` 10px (selos, faixa de valor e data), `--r-md` 16px (campos), `--r-lg` 24px (cartões e palco da caixa), botões e chips em pílula (999px).
- Sombras: **nenhuma** em cartões; separação por `--line` e pela troca de fundo. A única sombra é a de contato sob a caixa 3D, desenhada na própria cena.
- Foco: anel de 2px em `--accent` (no escuro, `--night-ink`) com 2px de afastamento, só no teclado (`:focus-visible`).

## Superfícies do navegador
- Seleção de texto: fundo `--night-rose`, texto `--ink` (7,8:1); no escuro, fundo `--night-ink`, texto `--night-bg`.
- Cursor de digitação: `caret-color: var(--accent)`.
- Controles nativos (data, seleção, checkbox): `accent-color: var(--accent)`.
- Barra de rolagem: `scrollbar-color: var(--line-strong) transparent`; no escuro, `--night-line`.
- Links: sublinhado de 1px com `text-underline-offset: 3px`.

## Layout
- **Topo das duas telas:** a marca "Amigo Secreto" (texto, sem logo inventado) e o botão de ícone para pausar/retomar as animações contínuas (some com `prefers-reduced-motion`). Na revelação a marca diz a quem veio do WhatsApp onde está.
- **Criar, celular:** marca, caixa 3D pequena (160px de altura) centralizada, título, texto de apoio e o formulário num cartão.
- **Criar, ≥ 1024px:** duas colunas. Esquerda (fixa ao rolar): marca, título, texto e a caixa 3D (320px). Direita: o formulário (até 560px).
- **Resultado do sorteio:** substitui o formulário, no mesmo cartão; a página volta ao topo e a caixa 3D do topo dá um pulo quando a lista aparece.
- **Revelação:** coluna única centralizada (até 560px). Marca, nome do grupo, "Olá, Ana", palco da caixa 3D (45% da altura da tela no celular) e o botão embaixo, na zona do polegar. Depois de aberto, o nome no lugar do botão e a faixa de valor e data.
- **Página 404 (`not-found`):** tema claro, sem fundo 3D, marca no topo, título "Página não encontrada", texto curto e botão principal "Criar um sorteio" para `/`.
- **Fundo 3D:** uma tela fixa atrás de tudo (`position: fixed`, sem receber cliques).

## Movimento
Curvas (da `emil-design-eng`; substituem a curva padrão da Taste):
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` para entradas e respostas.
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` para o que se move na tela (caixa encolhendo e voltando, câmera).
- Mola (bounce 0,2) só na tampa da caixa.
- `ease` só para troca de cor no hover. Nunca `ease-in`; `linear` só no giro contínuo da cena.

| O quê | Como | Duração |
|---|---|---|
| Botão pressionado | `scale(0.97)` | 140ms `--ease-out` |
| Hover de botão e link (só com mouse: `@media (hover: hover) and (pointer: fine)`) | cor | 150ms `ease` |
| Entrada da tela (uma vez) | título, texto e formulário sobem 8px e aparecem, 60–80ms entre eles; só em CSS, nunca escondido esperando o JavaScript | 320ms `--ease-out` |
| Chip de participante, restrição | **sem animação** (ação repetida e feita pelo teclado) | — |
| Resultado do sorteio | aviso aparece; linhas sobem 8px com 40–60ms entre elas | 260ms `--ease-out` |
| "Fazer outro sorteio" | o resultado some mais rápido do que o formulário volta | saída 150ms, entrada 260ms |
| "Copiar" → "Copiado" | troca com desfoque de 2px | 200ms |
| Caixa no topo da tela de criar | giro contínuo lento (uma volta a cada 18s) e flutuação de 4s; no desktop segue o ponteiro com mola suave | contínuo |
| Sorteio concluído | a caixa do topo dá um salto e a tampa pula uma vez (só se a caixa estiver visível) | 600ms |
| Abrir o presente (o momento do app) | a caixa encolhe 4% (preparação, 120ms `--ease-in-out`); a tampa sobe e gira com mola (~700ms); a câmera sobe e recua com mola sem quique (`fechada` → `aberta`) para a tampa e o laço caberem inteiros no palco; a luz de dentro acende; flocos saem da caixa (1,2s); o nome surge subindo 12px com desfoque 6→0 a partir de 350ms | ~1,2s no total |
| Flocos de fundo | queda e giro lentos, contínuos | contínuo |

- Abrir funciona pelo botão e também tocando na caixa.
- **Não anima:** digitação, campos, rolagem, texto longo. Nada aparece "ao rolar".
- **Pausa manual (WCAG 2.2.2):** o botão de ícone no topo pausa e retoma os flocos de fundo e o giro/flutuação da caixa, salvando a escolha no `localStorage`. Mesmo pausado, abrir o presente continua animando.
- **`prefers-reduced-motion`:** a cena 3D desenha um quadro parado (sem giro, flutuação ou flocos caindo); a tampa abre sem voar; o nome aparece só com opacidade (200ms); sem desfoque nem deslocamentos; a volta ao topo é instantânea.

## 3D (Three.js)
- `three` puro em componentes de cliente, importado sob demanda (`import()` dentro do efeito): a página carrega e funciona antes.
- No máximo 2 contextos WebGL por tela (fundo + caixa).
- Densidade de pixels limitada (caixa 1,5; fundo 1), pausa quando a aba fica oculta ou a tela sai da vista, menos flocos no celular (40 contra 90).
- Sem WebGL: a caixa vira um desenho em CSS com as mesmas cores, e o fundo fica liso.
- A cena é decorativa (`aria-hidden`); a ação de abrir é um `<button>` de verdade.

## Componentes
| Componente | Variações | Observações |
|---|---|---|
| Botão | principal (pílula `--accent`), secundário (pílula tonal `--surface`), texto (sublinhado) | **um botão principal por tela**; principal 52px, secundário 44px (48px ao lado de campo); desabilitado com 50% de opacidade |
| Botão de ícone | — | 44px, redondo, sem fundo, hover `--secondary-hover`; pausa/retoma animações contínuas no topo (some com `prefers-reduced-motion`) |
| Campo | texto, data, seleção | 48px, `--card`, borda `--line-field`, raio 16px; rótulo visível acima; erro abaixo do campo |
| Chip de participante | — | pílula `--surface`, botão "remover" com 44px de alvo e nome acessível ("Remover Ana") |
| Lista de restrições | — | linhas separadas por `--line`, sem fundo próprio; "Remover" como botão de texto |
| Aviso | informação, erro, sucesso | erro e sucesso com as cores de estado e um ícone; erro com `role="alert"`, perto do campo que causou |
| Cartão | formulário, resultado | `--card`, borda `--line`, raio 24px, 24px de respiro (32px no desktop) |
| Lista de links | — | dentro do cartão do resultado, linhas separadas por `--line`; no celular (`< 640px`), grade de 2 linhas (nome + selo `"enviado"` e `"Copiar link"` em cima, `"Enviar no WhatsApp"` ocupando a largura embaixo); a partir de `640px`, tudo numa linha só; ícone oficial do WhatsApp do Simple Icons, sem a cor da marca |
| Palco da caixa 3D | topo (pequeno), revelação (grande) | fallback em CSS; na revelação tem dois enquadramentos de câmera (`fechada` aproxima a caixa no palco; `aberta` sobe e recua a câmera para mostrar tampa e laço inteiros) |
| Faixa de valor e data | — | uma faixa `--night-surface` com duas colunas separadas por `--night-line`; rótulo em `--night-muted`, valor em `--night-ink` |
| Ícones | — | uma biblioteca só (Lucide), traço de 1,5px; nunca emoji |

### Estados
| Onde | Estado | Como fica |
|---|---|---|
| Sortear | incompleto | botão desabilitado com "Adicione mais N pessoas" |
| Sortear | enviando | botão desabilitado com "Sorteando…" |
| Sortear | sorteio impossível (422) | aviso de erro logo acima da lista de restrições, com o texto da API |
| Sortear | erro de rede | aviso de erro acima do botão; os dados preenchidos ficam |
| Copiar link | sem permissão de cópia | abre o link selecionado para copiar à mão |
| Revelação | carregando | a caixa flutua fechada; botão desabilitado com "Preparando seu presente…" |
| Revelação | link inválido | caixa parada, sem botão; texto explica e pede um novo link a quem organizou |
| Revelação | fechado / aberto | botão "Abrir o presente" / nome, faixa de valor e data |

## Pontos de quebra
375 (celular) · 768 (tablet) · 1024 (duas colunas) · 1440 (desktop)

## Decisões e exceções
- 2026-11-24: direção A sorteada pela Taste (`plaster-rose` + `funnel`, raio `round` por ser app de consumo).
- 2026-11-24: **sobrescrito da Taste:** as regras de página dela (uma seção por tela, fotos, momento ao rolar) são para sites e LPs; aqui são duas telas de tarefa (modo "Operate" da Impeccable), então valem só as regras de cor, tipo, movimento e acabamento.
- 2026-11-24: **sobrescrito da Taste:** ela permite "um efeito" por página e reserva cenas para sites de tecnologia; aqui o briefing pede 3D em três lugares (fundo nas duas telas e a caixa). Limite mantido de 2 contextos por tela.
- 2026-11-24: **sobrescrito da Taste:** a escala dela tem 13 e 14px, e 18px para destaque e cartão; aqui a escala é 14, 16, 20, 24, 32→40, 40→64 e 48→88px, com degraus de pelo menos 1,2× do corpo para cima.
- 2026-11-24: **sobrescrito da Taste:** curva padrão `cubic-bezier(.2,.8,.2,1)` trocada pelas curvas da `emil-design-eng`.
- 2026-11-24: o modo escuro automático sai (um sistema só). A revelação fica escura por escolha de cena, não de categoria: é o palco da caixa, aberta uma vez, no celular.
- 2026-11-24: borda dos campos escurecida para `#898383` (3,3:1), porque a borda de 11% da Taste (1,9:1) não atinge o mínimo de 3:1 para componentes de interface.
- 2026-11-24: revisão da Impeccable: restrições, lista de links e valor/data deixam de ser cartões (evita cartão dentro de cartão); flocos limitados a 0,2 de opacidade e cores secundárias só sobre superfícies sólidas; superfícies do navegador com as cores da paleta; marca no topo da revelação; estados de carregando, enviando e erro definidos.
- 2026-11-24: ajustes da construção: depois do sorteio a página volta ao topo da página (não do cartão), porque no celular a caixa do topo reage ao resultado; botão secundário com 48px ao lado de campo; flocos com cores e opacidade por tema (claro 0,2; escuro 0,18 com creme no lugar do vinho, que some no fundo escuro); contrastes sobre os flocos recalculados.
- 2026-11-24: **exceção registrada (Impeccable `cream-palette`):** o fundo creme `#f6f0eb` é sinalizado como padrão comum de IA, mas foi mantido por escolha explícita da direção A "Papel e rosa" (papel de presente).
- 2026-11-24: ajustes da etapa 5 (correção): lista de links em grade no celular (`< 640px`), dois enquadramentos de câmera na revelação (fechada/aberta), botão de ícone para pausar animações contínuas (WCAG 2.2.2), retorno de foco ao remover itens/sortear/recomeçar, página 404 personalizada, Open Graph específico na revelação sem expor o resultado, placeholders e selects curtos sem corte e aviso de restrição repetida.
