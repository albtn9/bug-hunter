# Report de bugs

Antes de reportar, conferi a seção "Sobre este ambiente" da documentação (carrinho só na aba, pedidos não armazenados, sem e-mail/cobrança, dados fixos, API sem estado). Nenhum dos bugs abaixo se enquadra nesses comportamentos esperados.

Ambiente: Verzel Store v2.3.0 (card VZS-142), Chrome (UI), Postman e Playwright (API), execução em 07 e 08/10/2026.

## Resumo

| ID | Título | Severidade | Prioridade | Critério | Onde |
|---|---|---|---|---|---|
| BUG-001 | Frete cobrado quando o subtotal é exatamente R\$ 200,00 | Alta | Alta | CA06, CA08 | UI e API |
| BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto | Média | Média | CA10 | API |
| BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto | Alta | Alta | CA10 | API |
| BUG-004 | Item sem `produtoId` retorna "Produto undefined não encontrado." | Baixa | Média | Validação de entrada / contrato da API | API |
| BUG-005 | E-mail com emoji no domínio é aceito na finalização da compra | Baixa | Média | Regra de e-mail válido (pré-existente) | UI |

---

## BUG-001 | Frete cobrado quando o subtotal é exatamente R\$ 200,00

- **Severidade / Prioridade:** Alta / Alta (regra financeira: o cliente paga R\$ 19,90 indevidamente)
- **Critérios de aceite:** CA06 ("frete grátis a partir de R\$ 200,00, **inclusive**"), CA08 (regra considera o subtotal antes do cupom)
- **Onde:** UI (carrinho) e API `POST /api/carrinho/calcular`
- **Pré-condições:** carrinho vazio; sem cupom aplicado

**Passos para reproduzir**

1. Na lista de produtos, adicionar 2 unidades de "Mochila Urbana 20L" (R\$ 100,00 cada).
2. Abrir o carrinho.
3. (Opcional) Aplicar o cupom `BEMVINDO10`.

*Via API:* `POST /api/carrinho/calcular` com o corpo `{ "itens": [{ "produtoId": "P005", "quantidade": 2 }] }`.

**Resultado esperado**

- Sem cupom: subtotal R\$ 200,00, frete R\$ 0,00 (grátis), total R\$ 200,00.
- Com `BEMVINDO10`: desconto R\$ 20,00, frete R\$ 0,00, total R\$ 180,00.

**Resultado obtido**

- Sem cupom: subtotal R\$ 200,00, frete **R\$ 19,90**, total **R\$ 219,90**.
- Com `BEMVINDO10`: desconto R\$ 20,00, frete **R\$ 19,90**, total **R\$ 199,90**.
- A interface exibe "Faltam R\$ 0,00 para o frete grátis", contradizendo a cobrança do frete.
- Na API, a mesma resposta traz `frete: 19.9`, `freteGratis: false` e `valorFaltanteFreteGratis: 0`.

**Análise**

- O desconto está correto (R\$ 20,00); o erro está só na regra do frete.
- A resposta da API se contradiz: `valorFaltanteFreteGratis: 0` indica que o limite foi atingido, mas `freteGratis: false` e `frete: 19.9` indicam o contrário. Hipótese: o cálculo do frete usa `> 200`, enquanto o do valor faltante usa `>= 200`.
- Subtotais acima (R\$ 219,80) e abaixo (R\$ 199,80) do limite se comportam corretamente, o que isola o defeito no valor exato de R\$ 200,00. Reproduzido também com `P008 × 4`.

**Evidências**

- `evidencias/BUG-001-ui-frete-subtotal-200-sem-cupom.png`
- `evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png`
- `evidencias/BUG-001-api-calcular-subtotal-200.png`
- `evidencias/BUG-001-playwright-relatorio-ca06.png`
- `evidencias/BUG-001-playwright-ui-ca06.png`
- `evidencias/BUG-001-playwright-ui-ca08.png`
- Testes automatizados que falham: `tests/api/calculo.spec.ts` (casos #4 e #5), `tests/api/frete-limite.spec.ts` (`P005 × 2` e `P008 × 4`) e `tests/ui/cupom-e-frete.spec.ts` (CA06 e CA08)

---

## BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Média / Média (a interface bloqueia a 6ª unidade; o defeito aparece em chamadas diretas à API)
- **Critério de aceite:** CA10 ("a regra vale para a interface e para a API")
- **Onde:** API `POST /api/carrinho/calcular`

**Passos para reproduzir**

1. Enviar `POST /api/carrinho/calcular` com `Content-Type: application/json` e o corpo:

```json
{ "itens": [{ "produtoId": "P004", "quantidade": 6 }] }
```

2. Repetir com quantidades maiores: `P002 × 12` + `P004 × 21` (com `BEMVINDO10`) e `P002`, `P004` e `P001` com `× 100` cada.

**Resultado esperado**

- Status **422** com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"` e `erro.campo = "itens[0].quantidade"`.

**Resultado obtido**

Status **200 OK** em todas as chamadas; a API calcula o carrinho normalmente com quantidades acima do limite:

- `P004 × 6`: subtotal R\$ 299,40, frete grátis, total R\$ 299,40.
- `P002 × 12` + `P004 × 21` com `BEMVINDO10`: subtotal R\$ 2.726,70, desconto R\$ 272,67, total R\$ 2.454,03.
- `P002`, `P004` e `P001` × 100 cada, com `BEMVINDO10`: subtotal R\$ 24.970,00, desconto R\$ 2.497,00, total R\$ 22.473,00.

**Observações**

- Com `quantidade: 5` a resposta é 200 (correto). Valores inválidos (0, -1, 1.5, "2" e null) retornam 422 `QUANTIDADE_INVALIDA` (correto).
- Na interface, o botão "+" fica desabilitado em 5 unidades e aparece "Limite de 5 unidades por produto." O defeito está na validação da API.

**Evidências**

- `evidencias/BUG-002-api-calcular-quantidade-6.png`
- `evidencias/BUG-002-api-calcular-quantidades-12-e-21.png`
- `evidencias/BUG-002-api-calcular-quantidade-100-tres-produtos.png`
- Testes automatizados que falham: `tests/api/cupom-e-quantidade.spec.ts` ("quantidade 6 é recusada" e "quantidade 100 é recusada")

---

## BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Alta / Alta (o pedido é confirmado fora da regra de negócio)
- **Critério de aceite:** CA10
- **Onde:** API `POST /api/pedidos`
- **Relacionado:** BUG-002 (mesma regra, rota diferente)

**Passos para reproduzir**

1. Enviar `POST /api/pedidos` com dados válidos de cliente e mais de 5 unidades de um produto:

```json
{
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
  "itens": [{ "produtoId": "P004", "quantidade": 6 }]
}
```

**Resultado esperado**

- Status **422** com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"`; nenhum pedido confirmado.

**Resultado obtido**

- Status **201 Created**, com o número de pedido `VZ-908998` (`criadoEm: 2026-10-07T22:43:49.903Z`), `quantidade: 6`, subtotal R\$ 299,40, frete grátis e total R\$ 299,40.

**Evidências**

- `evidencias/BUG-003-api-pedidos-quantidade-6.png`
- Teste automatizado que falha: `tests/api/cupom-e-quantidade.spec.ts` ("limite também vale ao confirmar o pedido")

---

## BUG-004 | Item sem `produtoId` retorna "Produto undefined não encontrado."

- **Severidade / Prioridade:** Baixa / Média (mensagem de erro enganosa e validação inconsistente; sem impacto financeiro)
- **Onde:** API `POST /api/carrinho/calcular`
- **Relacionado:** validação dos itens (`ITEM_INVALIDO`, `QUANTIDADE_INVALIDA`)

**Passos para reproduzir**

1. Enviar `POST /api/carrinho/calcular` com o corpo `{ "itens": [{}] }`.
2. Repetir com `{ "itens": [{ "quantidade": 1 }] }`.

**Resultado esperado**

- Um erro de validação que informe que o `produtoId` é obrigatório ou inválido, como acontece com a quantidade ausente. Também seria coerente `ITEM_INVALIDO`, definido na documentação como "Um item não é um objeto com produtoId e quantidade".

**Resultado obtido**

- Status **422** com `PRODUTO_NAO_ENCONTRADO`, mensagem `"Produto undefined não encontrado."` e campo `itens[0].produtoId`. A mensagem sugere a busca de um produto inexistente e expõe o valor `undefined`.

**Comparação com os outros itens inválidos**

| Item enviado | Código retornado | Mensagem |
|---|---|---|
| `{}` | `PRODUTO_NAO_ENCONTRADO` | Produto undefined não encontrado. |
| `{ "quantidade": 1 }` | `PRODUTO_NAO_ENCONTRADO` | Produto undefined não encontrado. |
| `{ "produtoId": "P001" }` | `QUANTIDADE_INVALIDA` | A quantidade deve ser um número inteiro maior ou igual a 1. |
| `null` ou `["P004"]` | `ITEM_INVALIDO` | Cada item deve ser um objeto com produtoId e quantidade. |

**Observação**

- A documentação não cita o caso `{}` explicitamente; a expectativa decorre da definição de `ITEM_INVALIDO` e do tratamento dado à quantidade ausente. Hipótese: a API busca o produto pelo `produtoId` antes de validar que o campo existe.

**Evidências**

- `evidencias/BUG-004-api-calcular-item-vazio.png`

---

## BUG-005 | E-mail com emoji no domínio é aceito na finalização da compra

- **Severidade / Prioridade:** Baixa / Média (dado inválido aceito; sem impacto financeiro)
- **Regra:** "O e-mail precisa ter um formato válido" (regras que já existiam antes da entrega, na documentação)
- **Onde:** UI (checkout)

**Passos para reproduzir**

1. Adicionar um produto ao carrinho e clicar em "Finalizar compra".
2. Preencher nome "Maria Silva", CEP "01310-100" e e-mail `email@email.😀`.
3. Clicar em "Confirmar pedido".

**Resultado esperado**

- Erro de e-mail inválido ("Informe um e-mail válido.") e pedido não confirmado.

**Resultado obtido**

- Pedido confirmado, com número de pedido gerado.

**Observações**

- Na API (`POST /api/pedidos`), `maria@exemplo.c` (extensão de 1 letra) também é aceito, enquanto `maria@exemplo` é recusado: a validação exige o ponto, mas não valida os caracteres da extensão do domínio.

**Evidências**

- `evidencias/BUG-005-ui-email-emoji.png`

---

## Observação sobre o que passou

- **Passaram:** CA01, CA02, CA03, CA04, CA05, CA07, CA09 e CA11, e 8 dos 10 casos da matriz de cálculo.
- **Falharam:** CA06 e CA08 (BUG-001).
- **CA10:** passou na interface e falhou na API (BUG-002 e BUG-003).
- A validação de quantidades inválidas (0, -1, 1.5, "2" e null) também passou.
