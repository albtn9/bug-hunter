# Teste técnico QA Júnior | Verzel Store

Validação da entrega **VZS-142 (v2.3.0): cupom de desconto e frete grátis**.

- Loja: [Verzel Store](https://verzel-store.qa-test-verzel-store.workers.dev/)
- Documentação: [Documentação](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao)
- API: [Verzel Store API](https://verzel-store.qa-test-verzel-store.workers.dev/api)

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

Pré-requisitos: Node.js 20 ou superior.

```bash
npm install
npx playwright install chromium

npm test            # API + UI
npm run test:api    # somente API
npm run test:ui     # somente UI
npm run report      # abre o relatório HTML
```

Para executar em outro ambiente, defina a variável BASE_URL antes de rodar os testes:

`BASE_URL=https://seu-ambiente.example npm test`

## Resultado de referência

Execução de referência (07/10/2026): **API 50 passou / 7 falhou** e **UI 32 passou / 2 falhou**.

As 9 falhas registradas correspondem aos BUG-001, BUG-002 e BUG-003, detalhados em [`docs/bugs.md`](docs/bugs.md) e [`docs/evidencias.md`](docs/evidencias.md).

Os BUG-004 e BUG-005 foram identificados em verificações manuais e exploratórias e não estão contabilizados como falhas da automação.

## Principais problemas identificados
 - BUG-001 — Frete grátis: o frete de R$ 19,90 é cobrado quando o subtotal é exatamente R$ 200,00.
 - BUG-002 — Limite de quantidade no cálculo: a API /api/carrinho/calcular aceita mais de 5 unidades do mesmo produto.
 - BUG-003 — Limite de quantidade no pedido: a API /api/pedidos permite confirmar pedidos com mais de 5 unidades do mesmo produto.
 - BUG-004 — Validação de item inválido: foi identificada uma resposta inconsistente ao enviar um item vazio; a expectativa para esse caso precisa ser confirmada.
 - BUG-005 — Validação de e-mail: a finalização aceita um endereço com emoji no domínio (email@email.😀), embora o formato de e-mail deva ser validado.

Consulte [`docs/bugs.md`](docs/bugs.md) para ver os detalhes e as evidências dos problemas identificados.

## Decisões e escopo

- Os valores esperados dos cálculos foram calculados manualmente e validados em [`docs/cenarios/04-calculo-total.feature`](docs/cenarios/04-calculo-total.feature).
- Os cenários utilizam tags de critério de aceite, tipo de teste e nível de automação.
- Os seletores de UI ficam em *page objects* em [`tests/support/pages/`](tests/support/pages), e os testes usam apenas métodos de negócio.
- Quando a interface muda, somente os page objects precisam ser ajustados.
- A automação usa fixtures para montar o carrinho e facilitar a execução dos testes.
- A utilização de ferramentas de inteligência artificial como apoio ao desenvolvimento deste projeto está documentada em [`docs/uso-de-ia.md`](docs/uso-de-ia.md).
