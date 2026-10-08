# Report de bugs

Antes de reportar, conferi a seção "Sobre este ambiente" da documentação (carrinho só na aba, pedidos não armazenados,
sem e-mail/cobrança, dados fixos, API sem estado). Nenhum dos bugs abaixo se enquadra nesses comportamentos esperados.

Ambiente: Verzel Store v2.3.0 (card VZS-142), Chrome (UI), Postman e Playwright (API), execução em 07/10/2026.

## Resumo

| ID | Título | Severidade | Prioridade | Critério | Onde |
|---|---|---|---|---|---|
| BUG-001 | Frete cobrado quando o subtotal é exatamente R$ 200,00 | Alta | Alta | CA06, CA08 | UI e API |
| BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto | Média | Média | CA10 | API |
| BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto | Alta | Alta | CA10 | API |
| BUG-004 | Item sem `produtoId` retorna "Produto undefined não encontrado." | Baixa | Média | Validação de entrada / contrato da API | API |


---

## BUG-001 | Frete cobrado quando o subtotal é exatamente R$ 200,00

- **Severidade / Prioridade:** Alta / Alta (regra de dinheiro: o cliente paga R$ 19,90 a mais)
- **Critérios de aceite:** CA06 ("frete grátis a partir de R$ 200,00, **inclusive**"), CA08 (regra considera o subtotal antes do cupom)
- **Onde:** UI (carrinho) e API `POST /api/carrinho/calcular`
- **Pré-condições:** carrinho vazio; sem cupom

**Passos para reproduzir**

1. Na lista de produtos, adicionar 2 unidades de "Mochila Urbana 20L" (R$ 100,00 cada).
2. Abrir o carrinho.
3. (Opcional) Aplicar o cupom `BEMVINDO10`.

Na API: `POST /api/carrinho/calcular` com `{ "itens": [{ "produtoId": "P005", "quantidade": 2 }] }`.

**Resultado esperado**

- Sem cupom: subtotal R$ 200,00, frete R$ 0,00 (grátis), total R$ 200,00.
- Com `BEMVINDO10`: desconto R$ 20,00, frete R$ 0,00, total R$ 180,00.

**Resultado obtido**

- Sem cupom: subtotal R$ 200,00, frete **R$ 19,90**, total **R$ 219,90**.
- Com `BEMVINDO10`: desconto R$ 20,00, frete **R$ 19,90**, total **R$ 199,90**.
- A tela exibe "Faltam R$ 0,00 para o frete grátis", contradizendo a cobrança do frete.
- Na API: `frete: 19.9`, `freteGratis: false` e `valorFaltanteFreteGratis: 0` na mesma resposta.

**Análise**

- O desconto está correto (R$ 20,00); o erro está só na regra do frete.
- A API se contradiz: informa que não falta nada para o frete grátis (`valorFaltanteFreteGratis: 0`, regra `>= 200`) e,
  ao mesmo tempo, cobra o frete (`freteGratis: false`, regra aparentemente `> 200`).
- Subtotais acima de R$ 200,00 (R$ 219,80, R$ 229,90 e R$ 239,70) calculam o frete grátis corretamente,
  e o subtotal de R$ 199,80 cobra o frete corretamente. Isso isola o defeito no valor exato do limite.
- Reproduzido também com `P008 × 4` (subtotal R$ 200,00).

**Evidências**

- `evidencias/BUG-001-ui-frete-subtotal-200-sem-cupom.png`
- `evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png`
- `evidencias/BUG-001-api-calcular-subtotal-200.png`
- `evidencias/BUG-001-playwright-relatorio-ca06.png`
- `evidencias/BUG-001-playwright-ui-ca06.png`
- `evidencias/BUG-001-playwright-ui-ca08.png`
- Testes automatizados que falham: `tests/api/calculo.spec.ts` (casos #4 e #5) e `tests/api/frete-limite.spec.ts`
  (`P005 × 2` e `P008 × 4`)

---

## BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Média / Média (a interface bloqueia o limite; o defeito só aparece em chamadas diretas à API)
- **Critério de aceite:** CA10 ("a regra vale para a interface e para a API")
- **Onde:** API `POST /api/carrinho/calcular`

**Passos para reproduzir**

1. Enviar `POST /api/carrinho/calcular` com `Content-Type: application/json` e o corpo:

```json
{ "itens": [{ "produtoId": "P004", "quantidade": 6 }] }
```

2. Repetir com quantidades maiores: `P002 × 12` + `P004 × 21` (com `BEMVINDO10`) e `P002`, `P004` e `P001` com `× 100` cada.

**Resultado esperado**

- Status 422 com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"` e `erro.campo = "itens[0].quantidade"`.

**Resultado obtido**

Status **200** em todas as chamadas; a API calcula o carrinho normalmente acima do limite:

- `P004 × 6`: subtotal R$ 299,40, frete grátis, total R$ 299,40.
- `P002 × 12` + `P004 × 21` com `BEMVINDO10`: subtotal R$ 2.726,70, desconto R$ 272,67, total R$ 2.454,03.
- `P002`, `P004` e `P001` × 100 cada, com `BEMVINDO10`: subtotal R$ 24.970,00, desconto R$ 2.497,00, total R$ 22.473,00.

**Observações**

- Com `quantidade: 5` a resposta é 200 (correto). Valores inválidos como 0, -1, 1.5, "2" e null retornam 422 `QUANTIDADE_INVALIDA` (correto).
- Na interface, o botão "+" fica desabilitado em 5 unidades e aparece "Limite de 5 unidades por produto." (passou em todos os 8 produtos).

**Evidências**

- `evidencias/BUG-002-api-calcular-quantidade-6.png`
- `evidencias/BUG-002-api-calcular-quantidades-12-e-21.png`
- `evidencias/BUG-002-api-calcular-quantidade-100-tres-produtos.png`
- Testes automatizados que falham: `tests/api/cupom-e-quantidade.spec.ts` ("quantidade 6 é recusada" e "quantidade 100 é recusada")

---

## BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Alta / Alta (o pedido é efetivamente confirmado fora da regra de negócio)
- **Critério de aceite:** CA10
- **Onde:** API `POST /api/pedidos`
- **Relacionado:** BUG-002 (mesma regra, rota diferente)

**Passos para reproduzir**

1. Enviar `POST /api/pedidos` com o corpo:

```json
{
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
  "itens": [{ "produtoId": "P004", "quantidade": 6 }]
}
```

**Resultado esperado**

- Status 422 com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"`; nenhum pedido confirmado.

**Resultado obtido**

- Status **201 Created**, pedido confirmado com número `VZ-908998` (criadoEm `2026-10-07T22:43:49.903Z`),
  `quantidade: 6`, subtotal R$ 299,40, frete grátis e total R$ 299,40.

**Evidências**

- `evidencias/BUG-003-api-pedidos-quantidade-6.png`
- Teste automatizado que falha: `tests/api/cupom-e-quantidade.spec.ts` ("limite também vale ao confirmar o pedido")

---


## BUG-004 | Item sem `produtoId` retorna "Produto undefined não encontrado."

* **Severidade / Prioridade:** Baixa / Média (mensagem de erro enganosa e validação inconsistente; sem impacto financeiro)
* **Onde:** API `POST /api/carrinho/calcular`
* **Relacionado:** validação dos itens (`ITEM_INVALIDO`, `QUANTIDADE_INVALIDA`)

**Passos para reproduzir**

1. Enviar `POST /api/carrinho/calcular` com `Content-Type: application/json` e o corpo:

```json
{ "itens": [{}] }
```

2. Repetir com `{ "itens": [{ "quantidade": 1 }] }`.

**Resultado esperado**

* Um erro de validação que informe que o `produtoId` é obrigatório ou inválido, como acontece com a quantidade ausente, que devolve `QUANTIDADE_INVALIDA` com uma mensagem clara. Também seria coerente `ITEM_INVALIDO`, definido na documentação como "Um item não é um objeto com produtoId e quantidade".

**Resultado obtido**

* Status 422 com `PRODUTO_NAO_ENCONTRADO`, mensagem `"Produto undefined não encontrado."` e campo `itens[0].produtoId`. A mensagem sugere uma busca por um produto que não existe e expõe o valor interno `undefined`.

**Comparação com os outros itens inválidos**

| Item enviado | Código | Mensagem |
|---|---|---|
| `{}` | `PRODUTO_NAO_ENCONTRADO` | Produto undefined não encontrado. |
| `{ "quantidade": 1 }` | `PRODUTO_NAO_ENCONTRADO` | Produto undefined não encontrado. |
| `{ "produtoId": "P001" }` | `QUANTIDADE_INVALIDA` | A quantidade deve ser um número inteiro maior ou igual a 1. |
| `null` e `["P004"]` | `ITEM_INVALIDO` | Cada item deve ser um objeto com produtoId e quantidade. |

**Evidências**

* `evidencias/BUG-004-api-calcular-item-vazio.png`

**Observação**

* Reproduzido em mais de uma execução.
* A documentação não cita o caso `{}` explicitamente; a expectativa decorre da definição de `ITEM_INVALIDO` e do tratamento dado à quantidade ausente.

---
## Observação sobre o que passou

Os critérios CA01, CA02, CA03, CA04, CA07 e CA09, os demais casos aprovados da matriz, a validação de quantidades inválidas e o limite de 5 unidades na interface passaram sem divergência. Foram registrados os BUG-001, BUG-002 e BUG-003, relacionados ao frete e ao limite de quantidade na API, além do BUG-004, referente à mensagem de erro para item sem `produtoId`.
