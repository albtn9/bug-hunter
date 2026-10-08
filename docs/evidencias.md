# Evidências da execução

## 1. Automação (Playwright)

- Data: 07/10/2026
- Comandos: `npm run test:api` e `npm run test:ui`
- Ambiente: Verzel Store v2.3.0, Chromium, 2 workers

| Projeto | Total | Passou | Falhou |
|---|---:|---:|---:|
| API | 57 | 50 | 7 |
| UI | 34 | 32 | 2 |

As 9 falhas correspondem aos bugs reportados em [`bugs.md`](bugs.md). Nenhuma outra falha ocorreu.

| Projeto | Teste que falha | Bug | Observado |
|---|---|---|---|
| API | `calculo.spec.ts` #4 limite exato (200,00) | BUG-001 | frete 19,9 (esperado 0) |
| API | `calculo.spec.ts` #5 200,00 com cupom (CA08) | BUG-001 | frete 19,9 (esperado 0) |
| API | `frete-limite.spec.ts` P005 × 2 = 200,00 | BUG-001 | `freteGratis: false` |
| API | `frete-limite.spec.ts` P008 × 4 = 200,00 | BUG-001 | `freteGratis: false` |
| API | `cupom-e-quantidade.spec.ts` quantidade 6 é recusada | BUG-002 | status 200 (esperado 422) |
| API | `cupom-e-quantidade.spec.ts` quantidade 100 é recusada | BUG-002 | status 200 (esperado 422) |
| API | `cupom-e-quantidade.spec.ts` limite também vale ao confirmar o pedido | BUG-003 | status 201 (esperado 422) |
| UI | `cupom-e-frete.spec.ts` CA06 subtotal de R$ 200,00 | BUG-001 | frete "R$ 19,90" (esperado "Grátis") |
| UI | `cupom-e-frete.spec.ts` CA08 frete considera subtotal antes do desconto | BUG-001 | frete "R$ 19,90" (esperado "Grátis") |

Os testes de controle que passam delimitam o defeito: subtotal R$ 199,80 (cobra frete) e R$ 219,80 (frete grátis).

## 2. Evidências manuais

| Arquivo | Cenário / bug | O que mostra |
|---|---|---|
| `BUG-001-ui-frete-subtotal-200-sem-cupom.png` | BUG-001, CA06 | Subtotal R$ 200,00 com frete R$ 19,90 e "Faltam R$ 0,00" |
| `BUG-001-ui-frete-subtotal-200-com-cupom.png` | BUG-001, CA08 | Com BEMVINDO10, total R$ 199,90 (esperado R$ 180,00) |
| `BUG-001-api-calcular-subtotal-200.png` | BUG-001 | API: `freteGratis: false` com `valorFaltanteFreteGratis: 0` |
| `BUG-002-api-calcular-quantidade-6.png` | BUG-002, CA10 | `/calcular` aceita 6 unidades (200) |
| `BUG-002-api-calcular-quantidades-12-e-21.png` | BUG-002, CA10 | `/calcular` aceita 12 e 21 unidades |
| `BUG-002-api-calcular-quantidade-100-tres-produtos.png` | BUG-002, CA10 | `/calcular` aceita 100 unidades de 3 produtos |
| `BUG-003-api-pedidos-quantidade-6.png` | BUG-003, CA10 | `/pedidos` confirma 6 unidades (201, VZ-908998) |
| `BUG-004-api-calcular-item-vazio.png` | BUG-004 | `{ "itens": [{}] }` retorna `PRODUTO_NAO_ENCONTRADO` com "Produto undefined não encontrado." |
| `CA10-ui-limite-5-todos-produtos.png` | CA10 (passou) | UI bloqueia em 5 unidades nos 8 produtos |
| `MANUAL-ui-pedido-confirmado-5-camisetas.png` | Pedido válido (passou) | Pedido VZ-298028 confirmado com dados válidos |
