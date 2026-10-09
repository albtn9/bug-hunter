# Teste técnico QA Júnior | Verzel Store

Validação da entrega **VZS-142 (v2.3.0): cupom de desconto e frete grátis**.

- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- Documentação da entrega: https://verzel-store.qa-test-verzel-store.workers.dev/documentacao
- API: https://verzel-store.qa-test-verzel-store.workers.dev/api

## Onde encontrar cada entrega

| Entrega | Onde |
|---|---|
| Cenários de teste (Gherkin em português) | [`docs/cenarios/`](docs/cenarios) |
| Execução dos testes | [`docs/execucao-manual.md`](docs/execucao-manual.md) |
| Relatório de bugs | [`docs/bugs.md`](docs/bugs.md) |
| Evidências | [`docs/evidencias.md`](docs/evidencias.md) |
| Ambiguidades e interpretações | [`docs/ambiguidades.md`](docs/ambiguidades.md) |
| Automação com Playwright | [`tests/`](tests) |

## Como rodar a automação

Pré-requisitos: Node.js 18+.

```bash
npm install
npx playwright install chromium

npm test            # API + UI
npm run test:api    # somente API
npm run test:ui     # somente UI
npm run report      # abre o relatório HTML
```

Para apontar para outro ambiente: `BASE_URL=https://... npm test`.

## Resultado de referência

Execução de referência (07/10/2026): **API 50 passou / 7 falhou** e **UI 32 passou / 2 falhou**.

As falhas correspondem aos bugs identificados e detalhados em [`docs/bugs.md`](docs/bugs.md) e [`docs/evidencias.md`](docs/evidencias.md).

## Decisões e escopo

- Os valores esperados dos cálculos foram calculados manualmente e validados em [`docs/cenarios/04-calculo-total.feature`](docs/cenarios/04-calculo-total.feature).
- Os cenários utilizam tags de critério de aceite, tipo de teste e nível de automação.
- Os seletores de UI ficam em *page objects* em [`tests/support/pages/`](tests/support/pages), e os testes usam apenas métodos de negócio.
- Quando a interface muda, somente os page objects precisam ser ajustados.
- A automação usa fixtures para montar o carrinho e facilitar a execução dos testes.
- A utilização de ferramentas de inteligência artificial como apoio ao desenvolvimento deste projeto está documentada em [`docs/uso-de-ia.md`](docs/uso-de-ia.md).
