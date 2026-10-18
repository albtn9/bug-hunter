# Respostas da API (execução manual)

Requisições feitas com **Bruno** (Windows) e **Insomnia** (Linux) contra `https://verzel-store.qa-test-verzel-store.workers.dev`, com `Content-Type: application/json`.
Cada seção corresponde a um cenário de [`execucao-manual.md`](../docs/execucao-manual.md) e traz a requisição e a resposta.
Respostas longas aparecem em trecho (`...`). Os bugs têm prints próprios, listados em [`evidencias.md`](../docs/evidencias.md).

## Cenário 18

**Subtotal logo abaixo de R$ 200,00 mantém o frete mesmo com cupom.** `POST /api/carrinho/calcular`

```json
{
  "itens": [
    { "produtoId": "P001", "quantidade": 1 },
    { "produtoId": "P002", "quantidade": 1 }
  ],
  "cupom": "BEMVINDO10"
}
```

Resposta `200 OK`:

```json
{
  "itens": [
    { "produtoId": "P001", "nome": "Camiseta Essencial", "precoUnitario": 59.9, "quantidade": 1, "total": 59.9 },
    { "produtoId": "P002", "nome": "Calça Jeans Slim", "precoUnitario": 139.9, "quantidade": 1, "total": 139.9 }
  ],
  "subtotal": 199.8,
  "desconto": 19.98,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 0.2,
  "total": 199.72,
  "cupom": { "codigo": "BEMVINDO10", "aplicado": true, "mensagem": "Cupom aplicado: 10% de desconto nos produtos." }
}
```

## Cenário 24

**Mesmo produto repetido na lista é rejeitado.** `POST /api/carrinho/calcular`

```json
{
  "itens": [
    { "produtoId": "P002", "quantidade": 1 },
    { "produtoId": "P002", "quantidade": 2 }
  ],
  "cupom": "BEM VINDO10"
}
```

Resposta `422 Unprocessable Entity`:

```json
{ "erro": { "codigo": "ITEM_DUPLICADO", "mensagem": "O produto P002 aparece mais de uma vez.", "campo": "itens[1].produtoId" } }
```

## Cenário 32

**Validação do nome: "Maria de Souza" é aceito.** `POST /api/pedidos` com `"nome": "Maria de Souza"` e `"cep": "01310-100"`.

Resposta `201 Created` (trecho):

```json
{ "numero": "VZ-664785", "cliente": { "nome": "Maria de Souza", "email": "maria@exemplo.c", "cep": "01310100" }, "total": 119.9 }
```

## Cenário 33

**Nomes nos limites da regra.** `POST /api/pedidos` com e-mail `maria@exemplo.com`, CEP `01310-100` e `{ "produtoId": "P005", "quantidade": 1 }`. Só o campo `nome` muda.

| Nome enviado | Resposta |
|---|---|
| `" Maria "` | `422` `DADOS_INVALIDOS`, campo `cliente.nome`: "Informe nome e sobrenome." |
| `"Maria  Silva"` (2 espaços) | `201`, pedido `VZ-572571`, nome devolvido como `"Maria  Silva"` |
| `"Maria S"` | `422` `DADOS_INVALIDOS`, campo `cliente.nome`: "Informe nome e sobrenome." |
| `"123 456"` | `201`, pedido `VZ-475958`, nome devolvido como `"123 456"` |

Exemplo de resposta `422`:

```json
{
  "erro": {
    "codigo": "DADOS_INVALIDOS",
    "mensagem": "Existem campos inválidos no pedido.",
    "campos": [ { "campo": "cliente.nome", "mensagem": "Informe nome e sobrenome." } ]
  }
}
```

## Cenário 35

**E-mails nos limites da regra.** `POST /api/pedidos` com nome `Maria Silva`, CEP `01310-100` e `{ "produtoId": "P005", "quantidade": 1 }`. Só o campo `email` muda.

| E-mail enviado | Resposta |
|---|---|
| `maria@exemplo` | `422` `DADOS_INVALIDOS`, campo `cliente.email`: "Informe um e-mail válido." |
| `maria@exemplo.c` | `201`, pedido `VZ-860513`, e-mail devolvido como `maria@exemplo.c` |
| `" maria@exemplo.com"` (espaço no início) | `201`, pedido `VZ-027390`, e-mail devolvido sem o espaço (`maria@exemplo.com`) |

Resposta `422` para `maria@exemplo`:

```json
{
  "erro": {
    "codigo": "DADOS_INVALIDOS",
    "mensagem": "Existem campos inválidos no pedido.",
    "campos": [ { "campo": "cliente.email", "mensagem": "Informe um e-mail válido." } ]
  }
}
```

Resposta `201 Created` para o e-mail com espaço no início (trecho):

```json
{
  "numero": "VZ-027390",
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310100" },
  "subtotal": 100,
  "frete": 19.9,
  "total": 119.9
}
```

## Cenário 36

**Validação do CEP.** `POST /api/pedidos` com nome `Maria Silva`, e-mail `" maria@exemplo.com"` e `{ "produtoId": "P005", "quantidade": 1 }`. Só o campo `cep` muda.

| CEP enviado | Resposta |
|---|---|
| `01310-100` | `201`, pedido `VZ-051723`, CEP devolvido como `01310100` |
| `0131-0100` | `422`, campo `cliente.cep`: "Informe um CEP com 8 dígitos." |
| `01310-10a` | `422`, campo `cliente.cep`: "Informe um CEP com 8 dígitos." |
| `" "` | `422`, campo `cliente.cep`: "Informe o CEP." |
| `""` | `422`, campo `cliente.cep`: "Informe o CEP." |

Os demais formatos (`0131010`, `013101000`, `01310-1000` e `abcdefgh`) estão cobertos por teste automatizado (`tests/api/contrato-e-erros.spec.ts`).

## Cenário 37

**Dados do cliente inválidos.** `POST /api/pedidos`

```json
{
  "cliente": { "nome": "Maria", "email": "maria", "cep": "123" },
  "itens": [ { "produtoId": "P005", "quantidade": 1 } ]
}
```

Resposta `422 Unprocessable Entity`:

```json
{
  "erro": {
    "codigo": "DADOS_INVALIDOS",
    "mensagem": "Existem campos inválidos no pedido.",
    "campos": [
      { "campo": "cliente.nome", "mensagem": "Informe nome e sobrenome." },
      { "campo": "cliente.email", "mensagem": "Informe um e-mail válido." },
      { "campo": "cliente.cep", "mensagem": "Informe um CEP com 8 dígitos." }
    ]
  }
}
```

## Cenário 41

**Consultar produto por id.**

`GET /api/produtos/P008`, resposta `200`:

```json
{ "id": "P008", "nome": "Garrafa Térmica 750ml", "descricao": "Mantém a temperatura por até 12 horas.", "categoria": "Acessórios", "preco": 50 }
```

`GET /api/produtos/P999`:

```json
{ "erro": { "codigo": "PRODUTO_NAO_ENCONTRADO", "mensagem": "Produto P999 não encontrado." } }
```

`GET /api/produtos/p001` (minúsculo): o id diferencia maiúsculas e minúsculas.

```json
{ "erro": { "codigo": "PRODUTO_NAO_ENCONTRADO", "mensagem": "Produto p001 não encontrado." } }
```

## Cenário 44

**Método não permitido.** `DELETE /api/produtos/P001`

```json
{ "erro": { "codigo": "METODO_NAO_PERMITIDO", "mensagem": "O método DELETE não é permitido nesta rota." } }
```

## Cenário 46

**Corpo que não é um objeto JSON.** `POST /api/carrinho/calcular` com o corpo `[]`, depois `"teste"` e depois `123`. As três respostas são `400 Bad Request`:

```json
{ "erro": { "codigo": "JSON_INVALIDO", "mensagem": "O corpo da requisição deve ser um objeto JSON válido." } }
```

`{}` é um objeto JSON válido e retorna `ITENS_OBRIGATORIOS` (coberto por teste automatizado).

## Cenário 49

**Item com produto inexistente.** `POST /api/carrinho/calcular`. O campo do erro aponta o índice do item com problema.

Produto inexistente na **segunda** posição:

```json
{
  "itens": [
    { "produtoId": "P002", "quantidade": 1 },
    { "produtoId": "P009", "quantidade": 1 }
  ]
}
```

Resposta `422 Unprocessable Entity`:

```json
{ "erro": { "codigo": "PRODUTO_NAO_ENCONTRADO", "mensagem": "Produto P009 não encontrado.", "campo": "itens[1].produtoId" } }
```

Produto inexistente na **primeira** posição (`P009` antes de `P002`, com `"cupom": "BEM VINDO10"`), resposta `422`:

```json
{ "erro": { "codigo": "PRODUTO_NAO_ENCONTRADO", "mensagem": "Produto P009 não encontrado.", "campo": "itens[0].produtoId" } }
```

## Cenário 50

**Campo do erro aponta o item com problema.** `POST /api/carrinho/calcular`

```json
{
  "itens": [
    { "produtoId": "P001", "quantidade": 1 },
    { "produtoId": "P002", "quantidade": 0 }
  ]
}
```

Resposta `422 Unprocessable Entity`:

```json
{ "erro": { "codigo": "QUANTIDADE_INVALIDA", "mensagem": "A quantidade deve ser um número inteiro maior ou igual a 1.", "campo": "itens[1].quantidade" } }
```

## Cenário 51

**Ordem de validação com mais de um problema.** `POST /api/carrinho/calcular`, com produto inexistente (`P024`) e quantidade inválida (`0`) em combinações diferentes:

| Chamada | `erro.codigo` | `erro.campo` |
|---|---|---|
| a) `P024` com quantidade `0` (no mesmo item) | `PRODUTO_NAO_ENCONTRADO` | `itens[0].produtoId` |
| b) `P002` com quantidade `0`, depois `P024` com quantidade `1` | `QUANTIDADE_INVALIDA` | `itens[0].quantidade` |
| c) `P024` com quantidade `1`, depois `P002` com quantidade `0` | `PRODUTO_NAO_ENCONTRADO` | `itens[0].produtoId` |

Conclusão: a API valida item por item, na ordem da lista, e retorna só o primeiro erro. Dentro do mesmo item, verifica o produto antes da quantidade.

Corpo da chamada (a) e resposta `422 Unprocessable Entity`:

```json
{ "itens": [ { "produtoId": "P024", "quantidade": 0 } ] }
```

```json
{ "erro": { "codigo": "PRODUTO_NAO_ENCONTRADO", "mensagem": "Produto P024 não encontrado.", "campo": "itens[0].produtoId" } }
```

Resposta da chamada (b):

```json
{ "erro": { "codigo": "QUANTIDADE_INVALIDA", "mensagem": "A quantidade deve ser um número inteiro maior ou igual a 1.", "campo": "itens[0].quantidade" } }
```

Com produto inexistente, quantidade acima do limite e cupom inválido ao mesmo tempo (`P024` com 1234 ou 400000 unidades e `"cupom": "BEM VINDO10"`), a resposta é a mesma `422 PRODUTO_NAO_ENCONTRADO` em `itens[0].produtoId`. A quantidade acima do limite não é rejeitada, porque a API não limita o máximo (BUG-002).

## Cenário 53

**Valores de cupom fora do padrão.** `POST /api/carrinho/calcular` com `{ "produtoId": "P005", "quantidade": 1 }` (e, no caso `""`, também `P004 × 5`). Só o campo `cupom` muda. Todas as respostas são `200 OK`; o campo `cupom` da resposta fica assim:

| `cupom` enviado | `cupom` na resposta |
|---|---|
| `""` | `null` (sem cupom; desconto 0) |
| `null` | `null` (sem cupom; desconto 0) |
| `123` | `{ "codigo": "123", "aplicado": false, "mensagem": "Cupom inválido." }` |
| `" "` | `{ "codigo": "", "aplicado": false, "mensagem": "Cupom inválido." }` |
| `true` | `{ "codigo": "true", "aplicado": false, "mensagem": "Cupom inválido." }` |

Resposta completa para `""` com `P004 × 5` e `P005 × 5` (trecho):

```json
{ "subtotal": 749.5, "desconto": 0, "frete": 0, "freteGratis": true, "valorFaltanteFreteGratis": 0, "total": 749.5, "cupom": null }
```

## Cenário 54

**Código do cupom devolvido na resposta.** `POST /api/carrinho/calcular`

```json
{ "itens": [ { "produtoId": "P002", "quantidade": 1 } ], "cupom": "BEMVINDO10" }
```

Resposta `200 OK` (trecho):

```json
{
  "subtotal": 139.9,
  "desconto": 13.99,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 60.1,
  "total": 145.81,
  "cupom": { "codigo": "BEMVINDO10", "aplicado": true, "mensagem": "Cupom aplicado: 10% de desconto nos produtos." }
}
```

Para cupom só com espaços, a resposta traz `"codigo": ""` e `"aplicado": false` (ver cenário 53).
