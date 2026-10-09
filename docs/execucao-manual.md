# Execução manual e exploratória

**Resumo:** 55 cenários, 45 ✔️ passaram e 10 ❌ falharam. Cada falha está ligada a um bug em [`bugs.md`](bugs.md).

Execução em 07 e 08/10/2026. A tabela segue os arquivos de [`cenarios/`](cenarios).

**Evidência:** *print* abre a imagem em [`evidencias/`](../evidencias); *Automação* é teste do Playwright ([`evidencias.md`](evidencias.md)); *Postman* é chamada manual, com o resultado na observação; *UI (manual)* é execução na tela, com o resultado na observação.

## 1. Cupom de desconto

Arquivo: `01-cupom-desconto.feature`

| # | Cenário | CA | Tipo | Resultado | Evidência | Observações |
|---:|---|---|---|---|---|---|
| 01 | Cupom BEMVINDO10 aplica 10% de desconto sobre o subtotal | CA01 | UI | ✔️ Passou | Automação | 2 Camisetas + 3 Calças: subtotal R$ 539,50, desconto R$ 53,95 (10%), frete grátis, total R$ 485,55. A UI mostra "Cupom BEMVINDO10 aplicado."; a frase "Cupom aplicado: 10%..." vem da API. |
| 02 | Código do cupom ignora maiúsculas/minúsculas e espaços nas pontas | CA02 | UI + API | ✔️ Passou | Automação | UI (5 variações) e API (6 variações) aceitam caixa e espaços nas pontas. |
| 03 | Códigos com espaço no meio ou vazios não aplicam desconto | CA02 | UI + API | ✔️ Passou | UI (manual) | UI: cupom vazio exibe "Informe um cupom."; `BEM VINDO10` é inválido. API: cupom só com espaços não aplica desconto (`aplicado: false`, desconto R$ 0,00). |
| 04 | Cupom inexistente exibe "Cupom inválido." e não desconta | CA03 | UI + API | ✔️ Passou | Automação | UI exibe "Cupom inválido." (role alert), desconto R$ 0,00 e total inalterado. API também passou. |
| 05 | Cupom expirado exibe "Cupom expirado." e não desconta | CA04 | UI + API | ✔️ Passou | Automação | UI exibe "Cupom expirado." sem desconto. API também passou. |
| 06 | Cupom expirado também respeita maiúsculas/minúsculas e espaços | CA04 | UI + API | ✔️ Passou | UI + Postman | Executado na UI e na API: `verao2026`, `VERAO2026`, `  VERAO2026` e `VERAO2026  ` retornam "Cupom expirado.". |
| 07 | Não é possível acumular dois cupons | CA05 | UI | ✔️ Passou | Automação | Com cupom aplicado, o campo de cupom some e só resta "Remover cupom". |
| 08 | Trocar de cupom removendo o atual antes | CA05 | UI | ✔️ Passou | Automação | "Remover cupom" restaura o resumo; o cupom expirado é recusado em seguida. |
| 09 | Reaplicar o mesmo cupom não duplica o desconto | CA05 | UI | ✔️ Passou | UI (manual) | Não é possível reaplicar o mesmo cupom: o campo fica oculto enquanto há cupom aplicado. |
| 10 | Alterar a quantidade com cupom aplicado recalcula o desconto e o total | CA08 | UI + API (exploratório) | ❌ Falhou (BUG-001) | [print](../evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png) | Com `BEMVINDO10`, aumentar de 1 para 2 mochilas leva o desconto de R$ 10,00 a R$ 20,00, mas cobra R$ 19,90 de frete. Total obtido R$ 199,90; esperado R$ 180,00. |
| 11 | Remover todos os itens com cupom aplicado | — | UI (exploratório) | ✔️ Passou | UI (manual) | Ao remover o último item, o carrinho fica vazio e nenhum desconto é exibido. Porém o cupom continua guardado: ao adicionar um novo item, ele reaparece aplicado (ambiguidade #17). |

## 2. Frete grátis

Arquivo: `02-frete-gratis.feature`

| # | Cenário | CA | Tipo | Resultado | Evidência | Observações |
|---:|---|---|---|---|---|---|
| 12 | Frete conforme o subtotal (limite de R$ 200,00 inclusive) | CA06, CA07 | UI + API | ❌ Falhou (BUG-001) | [print](../evidencias/BUG-001-api-calcular-subtotal-200.png) | As linhas de R$ 200,00 falham (frete R$ 19,90); as demais passam. |
| 13 | Carrinho informa quanto falta para o frete grátis | CA07 | UI | ❌ Falhou (BUG-001) | [print](../evidencias/BUG-001-ui-frete-subtotal-200-sem-cupom.png) | Com 1 mochila: "Faltam R$ 100,00". Com 2 mochilas (R$ 200,00): "Faltam R$ 0,00", mas cobra frete de R$ 19,90. |
| 14 | Ao atingir R$ 200,00 o aviso de "falta" deixa de ser exibido | CA06 | UI | ❌ Falhou (BUG-001) | [print](../evidencias/BUG-001-ui-frete-subtotal-200-sem-cupom.png) | Exibe "Faltam R$ 0,00 para o frete grátis" e cobra frete. |
| 15 | Frete grátis considera o subtotal ANTES do desconto | CA08 | UI + API | ❌ Falhou (BUG-001) | [print](../evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png) | Total R$ 199,90; esperado R$ 180,00. A causa está no limite de R$ 200,00. |
| 16 | Valor faltante não considera o desconto do cupom | CA08 | API | ✔️ Passou | Postman | P005 × 1 com `BEMVINDO10`: subtotal R$ 100,00, desconto R$ 10,00, frete R$ 19,90 e `valorFaltanteFreteGratis: 100`. O valor faltante usa o subtotal antes do desconto. |
| 17 | Desconto do cupom não incide sobre o frete | CA09 | UI + API | ✔️ Passou | [print](../evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png) | Com 2 mochilas: desconto de R$ 20,00 só sobre os produtos. |
| 18 | Subtotal logo abaixo de R$ 200,00 mantém o frete mesmo com cupom | CA08 | API | ✔️ Passou | Postman | Subtotal 199,80, desconto 19,98, frete 19,90, `freteGratis: false`, faltante 0,20 e total 199,72. O frete considera o subtotal antes do desconto. |

## 3. Limite de 5 unidades por produto

Arquivo: `03-limite-quantidade.feature`

| # | Cenário | CA | Tipo | Resultado | Evidência | Observações |
|---:|---|---|---|---|---|---|
| 19 | Interface permite até 5 unidades do mesmo produto | CA10 | UI | ✔️ Passou | [print](../evidencias/CA10-ui-limite-5-todos-produtos.png) | Os 8 produtos chegaram a 5 unidades. |
| 20 | Interface impede a 6ª unidade do mesmo produto | CA10 | UI | ✔️ Passou | [print](../evidencias/CA10-ui-limite-5-todos-produtos.png) | Botão "+" desabilitado e mensagem "Limite de 5 unidades por produto.". |
| 21 | Interface impede aumentar a quantidade para além de 5 no carrinho | CA10 | UI | ✔️ Passou | [print](../evidencias/CA10-ui-limite-5-todos-produtos.png) | Não há campo numérico; só botões "-" e "+". |
| 22 | API valida o limite de quantidade | CA10 | API | ❌ Falhou (BUG-002) | [print](../evidencias/BUG-002-api-calcular-quantidade-6.png) | 6, 12, 21 e 100 unidades aceitas (200). Valores inválidos (0, -1, 1.5, "2", null) retornam 422 corretamente. |
| 23 | API também aplica o limite ao confirmar o pedido | CA10 | API | ❌ Falhou (BUG-003) | [print](../evidencias/BUG-003-api-pedidos-quantidade-6.png) | 201 Created, pedido VZ-908998 com 6 unidades. |
| 24 | Mesmo produto repetido na lista é rejeitado como duplicado | CA10 | API | ✔️ Passou | Postman | P004 repetido (6+6, 3+2 e 1+0) retorna `ITEM_DUPLICADO`, com `campo: "itens[1].produtoId"`. |

## 4. Cálculo do total

Arquivo: `04-calculo-total.feature`

| # | Cenário | CA | Tipo | Resultado | Evidência | Observações |
|---:|---|---|---|---|---|---|
| 25 | Total do carrinho com e sem cupom | CA01, CA06–CA09, CA11 | API + UI | ❌ Falhou (BUG-001) | [print](../evidencias/BUG-001-api-calcular-subtotal-200.png) | 8 de 10 linhas passam; falham #4 e #5 (subtotal R$ 200,00). |
| 26 | Valores monetários da resposta têm no máximo 2 casas decimais | CA11 | API | ✔️ Passou | Automação | Conferido nos casos com risco de ponto flutuante (59,9 × 3 e 29,9 × 5). |
| 27 | Cálculo não grava nada e é repetível | — | API | ✔️ Passou | Automação | Duas chamadas iguais retornam respostas idênticas. |
| 28 | Cupom é opcional no cálculo | — | API | ✔️ Passou | Automação | As linhas sem cupom da matriz passam. |

## 5. Dados do cliente

Arquivo: `05-dados-do-cliente.feature`

| # | Cenário | CA | Tipo | Resultado | Evidência | Observações |
|---:|---|---|---|---|---|---|
| 29 | Pedido confirmado com dados válidos | — | UI + API | ✔️ Passou | [print](../evidencias/MANUAL-ui-pedido-confirmado-5-camisetas.png) | Pedido VZ-298028 (UI). Na API, 201 com número no formato VZ-000000. |
| 30 | Pedido com cupom válido confirma com desconto | — | API | ✔️ Passou | Automação | Resumo do pedido igual ao cálculo do carrinho. |
| 31 | Pedido com cupom inválido ou expirado é recusado | — | API | ✔️ Passou | Automação | 422 `CUPOM_INVALIDO` e `CUPOM_EXPIRADO`. |
| 32 | Validação do nome (precisa de nome e sobrenome) | — | UI + API | ✔️ Passou | Automação + Postman | "Maria" e vazio são recusados; "Maria Silva" e "Maria de Souza" são aceitos. |
| 33 | Nomes nos limites da regra | — | UI + API | ✔️ Passou | Postman | `" Maria "` recusado (espaços ignorados); `"Maria  Silva"` aceito e devolvido com 2 espaços; `"Maria S"` recusado ("Informe nome e sobrenome."); `"123 456"` aceito. Na UI também são aceitos emoji e caracteres especiais (ambiguidade #15). |
| 34 | Validação do e-mail | — | UI + API | ❌ Falhou (BUG-005) | [print](../evidencias/BUG-005-ui-email-emoji.png) | UI recusa `maria`, `maria@` e `@exemplo.com`; API recusa `maria`, `maria@`, `maria exemplo.com` e `maria@@exemplo.com` (`DADOS_INVALIDOS`). Porém `email@email.😀` é aceito na UI e na API. |
| 35 | E-mails nos limites da regra | — | UI + API | ✔️ Passou | Postman | `maria@exemplo` recusado (422); `maria@exemplo.c` aceito (201, extensão de 1 letra); `" maria@exemplo.com"` (espaço no início) sem erro de e-mail. Ver ambiguidade #16 e BUG-005. |
| 36 | Validação do CEP (8 dígitos, com ou sem hífen) | — | UI + API | ✔️ Passou | Automação + Postman | `01310-100` e `01310100` aceitos (CEP devolvido sem hífen); recusados com "Informe um CEP com 8 dígitos.": `0131010`, `013101000`, `01310-1000`, `0131-0100`, `01310-10a` e `abcdefgh`; vazio e `" "` retornam "Informe o CEP.". |
| 37 | Dados do cliente inválidos retornam DADOS_INVALIDOS | — | API | ✔️ Passou | Postman | 422 `DADOS_INVALIDOS` com `campos` (lista de {campo, mensagem}) para `cliente.nome`, `cliente.email` e `cliente.cep`, como descreve a documentação. |
| 38 | CEP é devolvido normalizado na resposta do pedido | — | API | ✔️ Passou | [print](../evidencias/CA-CEP-normalizado-resposta-pedido.png) | CEP devolvido sem hífen (`01310100`). Tratado como normalização intencional (ambiguidade #13). |
| 39 | Não existe etapa de pagamento online | — | UI | ✔️ Passou | Automação | O checkout pede só nome, e-mail e CEP e informa "O pagamento é feito na entrega.". |

## 6. Contrato da API e erros

Arquivo: `06-api-contrato-e-erros.feature`

| # | Cenário | CA | Tipo | Resultado | Evidência | Observações |
|---:|---|---|---|---|---|---|
| 40 | Listar produtos | — | API | ✔️ Passou | Automação | Os 8 produtos retornam com o contrato e os preços da documentação. |
| 41 | Consultar produto por id | — | API | ✔️ Passou | Postman | GET P001 e P008 retornam 200 com id, nome, descricao, categoria e preco; P999 e p001 retornam `PRODUTO_NAO_ENCONTRADO` (os ids diferenciam maiúsculas e minúsculas). |
| 42 | Produto inexistente retorna PRODUTO_NAO_ENCONTRADO no formato padrão de erro | — | API | ✔️ Passou | Automação | O erro traz `codigo` e `mensagem` no formato padrão. |
| 43 | Rota inexistente | — | API | ✔️ Passou | Automação | Retorna `ROTA_NAO_ENCONTRADA`. |
| 44 | Método HTTP não permitido | — | API | ✔️ Passou | Automação + Postman | `DELETE /api/produtos/P001` retorna `METODO_NAO_PERMITIDO`. GET em `/calcular` e `/pedidos` e POST em `/produtos` também (automatizado). |
| 45 | Corpo com JSON malformado | — | API | ✔️ Passou | Automação | Retorna `JSON_INVALIDO`. |
| 46 | Corpo que não é um objeto JSON | — | API | ✔️ Passou | Postman | `[]`, `"teste"`, `123` e `null` retornam `JSON_INVALIDO`. `{}` é um objeto JSON válido e retorna `ITENS_OBRIGATORIOS` (caso separado). |
| 47 | Lista de itens ausente ou vazia | — | API | ✔️ Passou | Automação | Retorna `ITENS_OBRIGATORIOS`. |
| 48 | Item que não é um objeto válido | — | API | ❌ Falhou (BUG-004) | [print](../evidencias/BUG-004-api-calcular-item-vazio.png) | `[null]`, `["P001"]` e `[["P004"]]` retornam `ITEM_INVALIDO`; `{}` e `{"quantidade":1}` retornam `PRODUTO_NAO_ENCONTRADO` ("Produto undefined não encontrado."); `{"produtoId":"P001"}` retorna `QUANTIDADE_INVALIDA` (`itens[0].quantidade`). |
| 49 | Item com produto inexistente | — | API | ✔️ Passou | Postman | P009 retorna `PRODUTO_NAO_ENCONTRADO` com `campo: "itens[1].produtoId"` quando o item inválido é o segundo da lista. |
| 50 | Campo do erro aponta o item com problema | — | API | ✔️ Passou | Postman | P001 × 1 + P002 × 0: 422 `QUANTIDADE_INVALIDA` com `campo: "itens[1].quantidade"`. |
| 51 | Ordem de validação quando há mais de um problema | — | API | ✔️ Passou | Postman | Quantidade inválida é reportada antes de produto inexistente; com quantidade válida, o produto inexistente é reportado. Cupom inválido vai em `cupom.mensagem` sem impedir o cálculo. A documentação não define a precedência; tratado como observação (ambiguidade #10). |
| 52 | Cupom inválido ou expirado no cálculo não gera erro | — | API | ✔️ Passou | Automação | Retorna 200 sem desconto, com o motivo em `cupom.mensagem`. |
| 53 | Valores de cupom fora do padrão | — | API | ✔️ Passou | Postman | `""` e `null` → 200 sem cupom (`cupom: null`); `123` e `true` → 200, convertidos para texto e tratados como "Cupom inválido."; `" "` → "Cupom inválido." com `codigo: ""` (diferente de `""`). Ver ambiguidade #14. |
| 54 | Código do cupom devolvido na resposta | — | API | ✔️ Passou | Postman | Cupom válido retorna `codigo: "BEMVINDO10"` e `aplicado: true`; cupom só com espaços volta com `codigo: ""` e `aplicado: false`. |
| 55 | Resumo do pedido confirmado é igual ao cálculo do carrinho | — | API | ✔️ Passou | Automação | Subtotal, desconto, frete e total do pedido são idênticos aos do cálculo. |

## Sessão exploratória

**Objetivo:** encontrar problemas em torno de cupom e frete que os critérios de aceite não cobrem diretamente.

**Duração:** 60 minutos

**Áreas exploradas:**

- cupons válidos, inválidos e expirados;
- espaços e diferenças entre maiúsculas e minúsculas;
- frete no limite de R$ 200,00 e desconto sobre o subtotal;
- quantidades e estruturas inválidas nas requisições da API;
- dados do cliente (nome, e-mail e CEP) e cupons fora do padrão na API.

**Achados:**

- ❌ **BUG-001:** com subtotal de exatamente R$ 200,00, o sistema cobra R$ 19,90 de frete mesmo informando que não falta valor para o frete grátis (UI e API, inclusive com `BEMVINDO10`).
- ❌ **BUG-002:** `POST /api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto.
- ❌ **BUG-003:** `POST /api/pedidos` confirma pedidos com mais de 5 unidades do mesmo produto.
- ❌ **BUG-004:** item sem `produtoId` (`{"itens":[{}]}`) retorna `PRODUTO_NAO_ENCONTRADO` com "Produto undefined não encontrado.", enquanto item sem quantidade retorna `QUANTIDADE_INVALIDA` e itens que não são objeto retornam `ITEM_INVALIDO`.
- ❌ **BUG-005:** e-mail com emoji no domínio (`email@email.😀`) é aceito na finalização da compra, na UI e na API.
- ℹ️ **Ambiguidade #17:** após remover todos os itens, o cupom continua guardado e reaparece aplicado ao adicionar um novo item.
- ℹ️ **Ambiguidade #15:** o nome aceita números, emoji e caracteres especiais (ex.: `!@#asd`), e a confirmação exibe esse valor.

**Comportamentos verificados:**

- ✔️ cupons expirados e inválidos são recusados, sem conceder desconto;
- ✔️ o desconto de 10% é calculado corretamente nos casos testados;
- ✔️ estruturas de requisição inválidas são rejeitadas, exceto o caso do BUG-004.
