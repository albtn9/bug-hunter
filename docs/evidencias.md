# Evidências da execução

## Critério adotado

Interpretei "evidências da execução" como a prova da execução como um todo, e não só dos bugs:

- **Bugs:** cada bug tem print ou resposta da API (seção 2) e está detalhado em [`bugs.md`](bugs.md).
- **Cenários cobertos pela automação:** a tabela de [`execucao-manual.md`](execucao-manual.md) aponta o spec, e a seção 1 traz o resultado da execução e os prints do relatório.
- **Cenários executados no Postman:** o resultado fica registrado na coluna "Observações" da tabela de execução manual e, quando houve divergência, nos prints da seção 2.
- **Principais cenários de UI que passaram:** têm print (seção 2).

## 1. Automação (Playwright)

- **Data da execução:** 07/10/2026
- **Comandos utilizados:** `npm run test:api` e `npm run test:ui`
- **Ambiente de teste:** Verzel Store v2.3.0, Chromium (UI), 2 workers em paralelo

| Projeto | Total de testes | Passou | Falhou |
|---|---:|---:|---:|
| API | 57 | 50 | 7 |
| UI | 34 | 32 | 2 |

As 9 falhas correspondem aos bugs BUG-001, BUG-002 e BUG-003, detalhados em [`bugs.md`](bugs.md). Nenhuma outra falha inesperada ocorreu. O BUG-004 e o BUG-005 foram encontrados na execução manual e exploratória e não têm teste automatizado.

### Detalhamento das falhas

| Projeto | Teste que falha | Bug | Comportamento observado |
|---|---|---|---|
| API | `calculo.spec.ts` #4 limite exato (200,00) | **BUG-001** | `frete` retornou `19.9` (esperado `0`) |
| API | `calculo.spec.ts` #5 200,00 com cupom (CA08) | **BUG-001** | `frete` retornou `19.9` (esperado `0`) |
| API | `frete-limite.spec.ts` P005 × 2 = 200,00 | **BUG-001** | `freteGratis: false` |
| API | `frete-limite.spec.ts` P008 × 4 = 200,00 | **BUG-001** | `freteGratis: false` |
| API | `cupom-e-quantidade.spec.ts` quantidade 6 é recusada | **BUG-002** | Status `200` (esperado `422`) |
| API | `cupom-e-quantidade.spec.ts` quantidade 100 é recusada | **BUG-002** | Status `200` (esperado `422`) |
| API | `cupom-e-quantidade.spec.ts` limite também vale ao confirmar o pedido | **BUG-003** | Status `201` (esperado `422`) |
| UI | `cupom-e-frete.spec.ts` CA06 subtotal de R\$ 200,00 | **BUG-001** | Frete exibido `"R$ 19,90"` (esperado `"Grátis"`) |
| UI | `cupom-e-frete.spec.ts` CA08 frete considera subtotal antes do desconto | **BUG-001** | Frete exibido `"R$ 19,90"` (esperado `"Grátis"`) |

Os testes de controle que passaram delimitam o defeito: o subtotal de R\$ 199,80 cobra frete corretamente e o de R\$ 219,80 tem frete grátis.

### Arquivos da automação

| Arquivo | O que mostra |
|---|---|
| `automacao-relatorio-html.png` | Relatório do `npx playwright show-report`: 91 testes, 82 passaram e 9 falharam |
| `BUG-001-playwright-relatorio-ca06.png` | Detalhe do CA06 no relatório: anotação `bug` (BUG-001) e erro (esperado "Grátis", recebido "R$ 19,90") |
| `BUG-001-playwright-ui-ca06.png` | Screenshot da falha do teste de UI do CA06 |
| `BUG-001-playwright-ui-ca08.png` | Screenshot da falha do teste de UI do CA08 |

---

## 2. Evidências manuais

Execução em 07 e 08/10/2026.

| Arquivo | Cenário / requisito | O que mostra |
|---|---|---|
| `BUG-001-ui-frete-subtotal-200-sem-cupom.png` | **BUG-001** / CA06 | Subtotal de R\$ 200,00 com frete de R\$ 19,90 e a frase "Faltam R\$ 0,00 para o frete grátis" |
| `BUG-001-ui-frete-subtotal-200-com-cupom.png` | **BUG-001** / CA08 | Com `BEMVINDO10`, total de R\$ 199,90 por causa do frete (esperado: R\$ 180,00) |
| `BUG-001-api-calcular-subtotal-200.png` | **BUG-001** | Resposta da API com `freteGratis: false` e `valorFaltanteFreteGratis: 0` |
| `BUG-002-api-calcular-quantidade-6.png` | **BUG-002** / CA10 | `/api/carrinho/calcular` aceita 6 unidades do mesmo item |
| `BUG-002-api-calcular-quantidades-12-e-21.png` | **BUG-002** / CA10 | `/api/carrinho/calcular` aceita 12 e 21 unidades de produtos diferentes |
| `BUG-002-api-calcular-quantidade-100-tres-produtos.png` | **BUG-002** / CA10 | `/api/carrinho/calcular` aceita 100 unidades de cada um de 3 produtos |
| `BUG-003-api-pedidos-quantidade-6.png` | **BUG-003** / CA10 | `201 Created` na confirmação do pedido `VZ-908998` com 6 unidades |
| `BUG-004-api-calcular-item-vazio.png` | **BUG-004** | `{ "itens": [{}] }` retorna `PRODUTO_NAO_ENCONTRADO` com "Produto undefined não encontrado." |
| `BUG-005-ui-email-emoji.png` | **BUG-005** | Pedido confirmado na UI com `email@email.😀` |
| `BUG-005-api-pedidos-email-emoji.png` | **BUG-005** | `POST /api/pedidos` retorna 201 com `email@email.😀` |
| `CA10-ui-limite-5-todos-produtos.png` | CA10 *(passou)* | A interface desabilita o botão "+" ao atingir 5 unidades nos 8 produtos |
| `MANUAL-ui-pedido-confirmado-5-camisetas.png` | Pedido válido *(passou)* | Pedido `VZ-298028` confirmado na interface com dados válidos |
