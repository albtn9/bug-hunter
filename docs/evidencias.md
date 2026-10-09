# Evidências da execução

## 1. Automação (Playwright)

- **Data da execução:** 07/10/2026
- **Comandos utilizados:** `npm run test:api` e `npm run test:ui`
- **Ambiente de teste:** Verzel Store v2.3.0, Execução via Chromium (2 workers em paralelo)

| Projeto | Total de Testes | Passou | Falhou |
|---|---:|---:|---:|
| API | 57 | 50 | 7 |
| UI | 34 | 32 | 2 |

As 9 falhas identificadas correspondem exatamente aos comportamentos mapeados e detalhados em [`bugs.md`](bugs.md). Nenhuma outra regressão ou falha inesperada ocorreu no ecossistema de testes.

### Detalhamento das Falhas de Automação

| Projeto | Teste que falha | Relação | Comportamento Observado |
|---|---|---|---|
| API | `calculo.spec.ts` #4 limite exato (200,00) | **BUG-001** | Propriedade `frete` retornou `19.9` (esperado `0`) |
| API | `calculo.spec.ts` #5 200,00 com cupom (**CA08**) | **BUG-001** | Propriedade `frete` retornou `19.9` (esperado `0`) |
| API | `frete-limite.spec.ts` P005 × 2 = 200,00 | **BUG-001** | Objeto contendo `freteGratis: false` |
| API | `frete-limite.spec.ts` P008 × 4 = 200,00 | **BUG-001** | Objeto contendo `freteGratis: false` |
| API | `cupom-e-quantidade.spec.ts` quantidade 6 é recusada | **BUG-002** | Retornou status HTTP `200` (esperado `422`) |
| API | `cupom-e-quantidade.spec.ts` quantidade 100 é recusada | **BUG-002** | Retornou status HTTP `200` (esperado `422`) |
| API | `cupom-e-quantidade.spec.ts` limite também vale ao confirmar o pedido | **BUG-003** | Retornou status HTTP `201` (esperado `422`) |
| UI | `cupom-e-frete.spec.ts` **CA06** subtotal de R\$ 200,00 | **BUG-001** | Interface renderiza frete `"R$ 19,90"` (esperado `"Grátis"`) |
| UI | `cupom-e-frete.spec.ts` **CA08** frete considera subtotal antes do desconto | **BUG-001** | Interface renderiza frete `"R$ 19,90"` (esperado `"Grátis"`) |

*Nota de Controle:* Os testes de contorno sanitários que foram aprovados ajudam a delimitar o escopo do erro lógico: subtotais em R\$ 199,80 cobram frete de forma correta e valores em R\$ 219,80 ativam a gratuidade com sucesso.

---

## 2. Evidências Manuais (Mapeamento de Mídias)

| Arquivo de Imagem | Cenário / Requisito | O que a evidência demonstra |
|---|---|---|
| `BUG-001-ui-frete-subtotal-200-sem-cupom.png` | **BUG-001** / **CA06** | Exibição de Subtotal em R\$ 200,00 com taxa de frete ativa em R\$ 19,90 concomitante à frase informativa "Faltam R\$ 0,00 para o frete grátis". |
| `BUG-001-ui-frete-subtotal-200-com-cupom.png` | **BUG-001** / **CA08** | Aplicação do cupom `BEMVINDO10` gerando total incorreto de R\$ 199,90 em decorrência da adição de frete (total esperado era R\$ 180,00). |
| `BUG-001-api-calcular-subtotal-200.png` | **BUG-001** | Resposta JSON da API expondo colisão lógica: `freteGratis: false` associado a `valorFaltanteFreteGratis: 0`. |
| `BUG-002-api-calcular-quantidade-6.png` | **BUG-002** / **CA10** | Sucesso no endpoint `/calcular` aceitando payload de requisição contendo 6 unidades do mesmo item. |
| `BUG-002-api-calcular-quantidades-12-e-21.png` | **BUG-002** / **CA10** | Sucesso no endpoint `/calcular` processando lotes abusivos de 12 e 21 itens de produtos distintos. |
| `BUG-002-api-calcular-quantidade-100-tres-produtos.png` | **BUG-002** / **CA10** | Processamento sem restrições de payload contendo carga massiva de 100 unidades para 3 produtos simultâneos. |
| `BUG-003-api-pedidos-quantidade-6.png` | **BUG-003** / **CA10** | Retorno HTTP `201 Created` gerando a confirmação e persistência do pedido irregular de código `VZ-908998`. |
| `BUG-004-api-calcular-item-vazio.png` | **BUG-004** | Payload contendo estrutura vazia `{ "itens": [{}] }` resultando em erro `PRODUTO_NAO_ENCONTRADO` com a mensagem textual literal: `"Produto undefined não encontrado."`. |
| `CA10-ui-limite-5-todos-produtos.png` | **CA10** *(Passou)* | Interface web desabilitando corretamente os botões de incremento numérico ao atingir a trava de 5 unidades em todos os 8 produtos disponíveis. |
| `MANUAL-ui-pedido-confirmado-5-camisetas.png` | Transação Válida | Fluxo fim a fim de sucesso: Pedido `VZ-298028` gerado e concluído na interface adotando dados válidos e massa higienizada. |
