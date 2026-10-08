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

Execução de referência (07/10/2026): **API 50 passou / 7 falhou** e **UI 32 passou / 2 falhou**; as 9 falhas
são os bugs BUG-001, BUG-002 e BUG-003 (detalhes em [`docs/evidencias.md`](docs/evidencias.md)).

## Decisões

- O ambiente é compartilhado: poucos workers, **sem testes de carga, estresse ou segurança** (fora do escopo).
- Os valores esperados dos cálculos foram calculados à mão e estão em `tests/support/dados.ts`
  e em `docs/cenarios/04-calculo-total.feature`, independentes da API.
- Os cenários têm tags: `@CAxx` (critério de aceite), `@ui`, `@api`, `@automatizado`,
  `@exploratorio` e `@ambiguidade`.
- **Seletores de UI** ficam em *page objects* (`tests/support/pages/`) e os specs só usam métodos de negócio
  (`montarCarrinho`, `aplicarCupom`, `esperarResumo`). A loja não tem `data-testid`, então os seletores usam:
  papéis e nomes acessíveis (`getByRole`, `getByLabel`, os `aria-label` da própria interface) e o atributo
  `data-valor` do resumo do pedido. Se a interface mudar, só os page objects precisam ser ajustados.
- **Carrinho semeado:** a loja guarda o carrinho em `sessionStorage` (`verzel-store:itens`, formato
  `[{ "produtoId": "P005", "quantidade": 2 }]`). A fixture `carrinhoCom([...])` grava isso direto e abre `/carrinho`,
  o que deixa os testes rápidos; a fixture `montarCarrinho` percorre a interface (usada na jornada de compra).
- `docs/dom-referencia/` guarda o HTML de cada tela usado para escolher os seletores (vitrine, carrinho vazio,
  carrinho com limite de 5, cupom aplicado, cupom inválido, checkout com erros e documentação).
- Fixtures (`tests/support/fixtures.ts`) montam o carrinho e entregam os page objects; `anotacoes.ts` liga o teste ao bug.
