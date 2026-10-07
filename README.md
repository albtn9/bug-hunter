# Teste técnico QA Júnior | Verzel Store

Validação da entrega **VZS-142 (v2.3.0): cupom de desconto e frete grátis**.

- Loja: https://verzel-store.qa-test-verzel-store.workers.dev/
- Documentação da entrega: https://verzel-store.qa-test-verzel-store.workers.dev/documentacao
- API: https://verzel-store.qa-test-verzel-store.workers.dev/api

## Onde encontrar cada entrega

| Entrega | Onde |
|---|---|
| Cenários de teste (Gherkin em português) | [`docs/cenarios/`](docs/cenarios) |
| Execução dos testes (manual e exploratória) com resultado de cada cenário | [`docs/execucao-manual.md`](docs/execucao-manual.md) |
| Report de bugs | [`docs/bugs.md`](docs/bugs.md) |
| Documento de evidências | [`docs/evidencias.md`](docs/evidencias.md) (arquivos em [`evidencias/`](evidencias)) |
| Ambiguidades e minhas interpretações | [`docs/ambiguidades.md`](docs/ambiguidades.md) |
| Automação com Playwright | [`tests/`](tests) |
| Uso de IA | [`docs/uso-de-ia.md`](docs/uso-de-ia.md) |

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

Para apontar para outro endereço: `BASE_URL=https://... npm test`.

## Falhas esperadas na automação

Alguns testes **falham de propósito**: eles reproduzem os bugs encontrados e carregam a anotação `bug`
com o ID (BUG-001 a BUG-003, ver [`docs/bugs.md`](docs/bugs.md)). Quando o defeito for corrigido, o teste passa.
O relatório HTML mostra a anotação em cada teste. Qualquer outra falha deve ser investigada.

## Decisões

- O ambiente é compartilhado: poucos workers, **sem testes de carga, estresse ou segurança** (fora do escopo).
- Os valores esperados dos cálculos foram calculados à mão e estão em `tests/support/dados.ts`
  e em `docs/cenarios/04-calculo-total.feature`, independentes da API.
- Os cenários têm tags: `@CAxx` (critério de aceite), `@ui`, `@api`, `@automatizado`,
  `@exploratorio` e `@ambiguidade`.
- Seletores de UI ficam centralizados em `tests/support/loja.page.ts`.
