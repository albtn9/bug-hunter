# Report de bugs

Antes de reportar, conferi a seção "Sobre este ambiente" da documentação (carrinho só na aba, pedidos não armazenados, sem e-mail/cobrança, dados fixos, API sem estado). Nenhum dos bugs abaixo se enquadra nesses comportamentos esperados.

Ambiente: Verzel Store v2.3.0 (card VZS-142), Chrome (UI), Postman e Playwright (API), execução em 07/10/2026.

## Resumo

| ID | Título | Severidade | Prioridade | Critério | Onde |
|---|---|---|---|---|---|
| BUG-001 | Frete cobrado quando o subtotal é exatamente R\$ 200,00 | Alta | Alta | CA06, CA08 | UI e API |
| BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto | Média | Média | CA10 | API |
| BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto | Alta | Alta | CA10 | API |
| BUG-004 | Item sem `produtoId` retorna "Produto undefined não encontrado." | Baixa | Média | Validação de entrada / contrato da API | API |

---

## BUG-001 | Frete cobrado quando o subtotal é exatamente R\$ 200,00

- **Severidade / Prioridade:** Alta / Alta (regra financeira: o cliente paga R\$ 19,90 indevidamente)
- **Critérios de aceite:** CA06 ("frete grátis a partir de R\$ 200,00, **inclusive**"), CA08 (regra considera o subtotal antes do cupom)
- **Onde:** UI (carrinho) e API `POST /api/carrinho/calcular`
- **Pré-condições:** carrinho vazio; sem cupom aplicado

**Passos para reproduzir**

1. Na lista de produtos, adicionar 2 unidades de "Mochila Urbana 20L" (R\$ 100,00 cada).
2. Abrir o carrinho de compras.
3. (Opcional) Aplicar o cupom de desconto `BEMVINDO10`.

*Via API:* Enviar requisição `POST /api/carrinho/calcular` com o payload `{ "itens": [{ "produtoId": "P005", "quantidade": 2 }] }`.

**Resultado esperado**

- Sem cupom: subtotal R\$ 200,00, frete R\$ 0,00 (grátis), total R\$ 200,00.
- Com `BEMVINDO10`: desconto R\$ 20,00, frete R\$ 0,00, total R\$ 180,00.

**Resultado obtido**

- Sem cupom: subtotal R\$ 200,00, frete **R\$ 19,90**, total **R\$ 219,90**.
- Com `BEMVINDO10`: desconto R\$ 20,00, frete **R\$ 19,90**, total **R\$ 199,90**.
- A interface exibe textualmente "Faltam R\$ 0,00 para o frete grátis", gerando contradição visual com a cobrança da taxa de R\$ 19,90.
- Retorno da API: `frete: 19.9`, `freteGratis: false` e `valorFaltanteFreteGratis: 0` encapsulados na mesma resposta.

**Análise & Causa Raiz**

- O cálculo de desconto opera corretamente (R\$ 20,00); a falha reside estritamente na validação lógica do frete.
- Há uma contradição de lógica no back-end: a propriedade `valorFaltanteFreteGratis: 0` adota a regra correta (`>= 200`), enquanto a propriedade `freteGratis: false` utiliza incorretamente um operador estrito maior que (`> 200`).
- Subtotais acima do limite (ex: R\$ 219,80) e abaixo (ex: R\$ 199,80) funcionam adequadamente, isolando o defeito exatamente no valor limiar de R\$ 200,00. Reproduzido também sob a composição `P008 × 4`.

**Evidências**

- `evidencias/BUG-001-ui-frete-subtotal-200-sem-cupom.png`
- `evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png`
- `evidencias/BUG-001-api-calcular-subtotal-200.png`
- `evidencias/BUG-001-playwright-relatorio-ca06.png`
- `evidencias/BUG-001-playwright-ui-ca06.png`
- `evidencias/BUG-001-playwright-ui-ca08.png`
- Testes automatizados que falham: `tests/api/calculo.spec.ts` (casos #4 e #5) e `tests/api/frete-limite.spec.ts` (`P005 × 2` e `P008 × 4`)

---

## BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Média / Média (a interface web mitiga o cenário bloqueando a ação do usuário; a falha fica exposta em chamadas diretas de integração)
- **Critério de aceite:** CA10 ("a regra vale para a interface e para a API")
- **Onde:** API `POST /api/carrinho/calcular`

**Passos para reproduzir**

1. Enviar um `POST /api/carrinho/calcular` com o cabeçalho `Content-Type: application/json` e o corpo contendo quantidade abusiva:
```json
{ "itens": [{ "produtoId": "P004", "quantidade": 6 }] }
```
2. Repetir variando cenários de carga: `P002 × 12` + `P004 × 21` (com cupom `BEMVINDO10`) ou cargas massivas (`P002`, `P004` e `P001` com `× 100` cada).

**Resultado esperado**

- Resposta com status HTTP **422 Unprocessable Entity** contendo as propriedades estruturadas `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"` e `erro.campo = "itens.quantidade"`.

**Resultado obtido**

Status **200 OK** retornado em todas as volumetrias abusivas; a camada de negócio da API calcula as somas ignorando as travas de estoque:
- `P004 × 6`: subtotal R\$ 299,40, frete grátis, total R\$ 299,40.
- `P002 × 12` + `P004 × 21` com `BEMVINDO10`: subtotal R\$ 2.726,70, desconto R\$ 272,67, total R\$ 2.454,03.
- Carga nominal massiva (100 unidades de cada): processamento aceito totalizando subtotal de R\$ 24.970,00.

**Observações**

- Inputs limiares permitidos (`quantidade: 5`) processam normalmente em código 200. Inputs negativos, nulos ou decimais disparam corretamente o erro `QUANTIDADE_INVALIDA` (HTTP 422).
- Na camada do Front-end (UI), o componente seletor manipula a regra perfeitamente, desabilitando o gatilho "+" ao atingir 5 unidades. O defeito caracteriza **falha de validação e sanitização na camada de Back-end**.

**Evidências**

- `evidencias/BUG-002-api-calcular-quantidade-6.png`
- `evidencias/BUG-002-api-calcular-quantidades-12-e-21.png`
- `evidencias/BUG-002-api-calcular-quantidade-100-tres-produtos.png`
- Testes automatizados que falham: `tests/api/cupom-e-quantidade.spec.ts` ("quantidade 6 é recusada" e "quantidade 100 é recusada")

---

## BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Alta / Alta (permite a quebra de regras de estoque e consolidação de transações irregulares no banco)
- **Critério de aceite:** CA10
- **Onde:** API `POST /api/pedidos`
- **Relacionado:** BUG-002 (mesma regra de teto logístico, endpoints distintos)

**Passos para reproduzir**

1. Enviar requisição `POST /api/pedidos` injetando dados válidos de cliente, mas volumetria acima do limite de itens:
```json
{
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
  "itens": [{ "produtoId": "P004", "quantidade": 6 }]
}
```

**Resultado esperado**

- Retorno HTTP **422 Unprocessable Entity** com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"`, bloqueando a geração da ordem de compra.

**Resultado obtido**

- Status **201 Created**, persistindo e gerando o pedido de identificação `VZ-908998` (`criadoEm: 2026-10-07T22:43:49.903Z`), faturando 6 unidades sob subtotal de R\$ 299,40 com frete gratuito.

**Evidências**

- `evidencias/BUG-003-api-pedidos-quantidade-6.png`
- Teste automatizado que falha: `tests/api/cupom-e-quantidade.spec.ts` ("limite também vale ao confirmar o pedido")

---

## BUG-004 | Item sem `produtoId` retorna "Produto undefined não encontrado."

- **Severidade / Prioridade:** Baixa / Média (vazamento de termos internos de desenvolvimento na mensagem de erro; sem impactos de cálculo ou financeiros)
- **Onde:** API `POST /api/carrinho/calcular`
- **Relacionado:** validação estrutural do nó de itens (`ITEM_INVALIDO`, `QUANTIDADE_INVALIDA`)

**Passos para reproduzir**

1. Enviar `POST /api/carrinho/calcular` com um objeto de item totalmente desprovido de propriedades: `{ "itens": [{}] }`
2. Repetir a chamada informando apenas o parâmetro numérico: `{ "itens": [{ "quantidade": 1 }] }`

**Resultado esperado**

- Resposta de rejeição contratual coerente. Espera-se o retorno do código `ITEM_INVALIDO` (definido no escopo como "Um item não é um objeto com produtoId e quantidade") ou um alerta explícito indicando a obrigatoriedade do campo de identificação do item.

**Resultado obtido**

- Status HTTP **422 Unprocessable Entity** retornando o código de erro genérico `PRODUTO_NAO_ENCONTRADO`, acompanhado da mensagem string `"Produto undefined não encontrado."` apontando para o ponteiro `itens.produtoId`. 

**Análise de Comparação de Inputs Incorretos**

A tabela expõe a falta de padronização no tratamento do payload quando a chave identificadora é suprimida:

| Item enviado | Código Retornado | Mensagem de Erro Obtida |
|---|---|---|
| `{}` | `PRODUTO_NAO_ENCONTRADO` | Produto undefined não encontrado. |
| `{ "quantidade": 1 }` | `PRODUTO_NAO_ENCONTRADO` | Produto undefined não encontrado. |
| `{ "produtoId": "P001" }` | `QUANTIDADE_INVALIDA` | A quantidade deve ser um número inteiro maior ou igual a 1. |
| `null` ou `["P004"]` | `ITEM_INVALIDO` | Cada item deve ser um objeto com produtoId e quantidade. |

*Causa raiz:* O back-end tenta mapear a propriedade de busca de estoque diretamente através da leitura crua de chaves (`item.produtoId`) sem antes validar a existência e presença do atributo no objeto recebido, vazando o valor primitivo `undefined` do JavaScript na resposta final do cliente.

**Evidências**

- `evidencias/BUG-004-api-calcular-item-vazio.png`

---
## Observação sobre critérios em conformidade

Os critérios de aceite **CA01, CA02, CA03, CA04, CA07 e CA09**, os demais comportamentos calculatórios da matriz cruzada de descontos, o tratamento de payloads com quantidades negativas/nulas e o bloqueio de incremento visual no Front-end passaram com total sucesso e aderência aos requisitos especificados.
