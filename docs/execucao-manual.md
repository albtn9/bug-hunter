# Execução manual e exploratória

Legenda: **Passou**, **Falhou**, **Parcial** (parte executada; ver observação) e **A executar**. Quando o cenário foi coberto pela automação, está indicado em Observações.
Data das execuções já registradas: 07/10/2026. Atualizações manuais desta revisão: 08/10/2026. Em caso de falha, o BUG está detalhado em [`bugs.md`](bugs.md).

| # | Arquivo | Cenário | CA | Tipo | Resultado | Bug | Evidência | Observações |
|---|---|---|---|---|---|---|---|---|
| 01 | 01-cupom-desconto.feature | Cupom BEMVINDO10 aplica 10% de desconto sobre o subtotal | CA01 | ui | Passou |  | `tests/ui/cupom-e-frete.spec.ts` | 2 Camisetas + 3 Calças: subtotal R$ 539,50, desconto R$ 53,95 (10%), frete Grátis, total R$ 485,55. A UI exibe "Cupom BEMVINDO10 aplicado." (a frase "Cupom aplicado: 10%..." é da API). |
| 02 | 01-cupom-desconto.feature | Código do cupom ignora maiúsculas/minúsculas e espaços nas pontas | CA02 | ui,api | Passou |  |  | Automatizado: UI (5 variações) e API (6 variações) aceitam caixa e espaços nas pontas. |
| 03 | 01-cupom-desconto.feature | Códigos com espaço no meio ou vazios não aplicam desconto | CA02 | ui,api | Passou |  |  | UI: cupom vazio exibe “Informe um cupom.”; `BEM VINDO10` é inválido. API: cupom composto por espaços não aplica desconto (`aplicado: false`, desconto R$ 0,00). |
| 04 | 01-cupom-desconto.feature | Cupom inexistente exibe "Cupom inválido." e não desconta | CA03 | ui,api | Passou |  | `tests/ui/cupom-e-frete.spec.ts` | UI exibe "Cupom inválido." (role alert, campo com aria-invalid), desconto R$ 0,00 e total sem alteração. API também passou (automatizado). |
| 05 | 01-cupom-desconto.feature | Cupom expirado exibe "Cupom expirado." e não desconta | CA04 | ui,api | Passou |  |  | Automatizado: UI exibe "Cupom expirado." (role alert) sem desconto; API também passou. |
| 06 | 01-cupom-desconto.feature | Cupom expirado também respeita maiúsculas/minúsculas e espaços | CA04 | ui,api | Passou |  |  | Confirmado pelo usuário na UI e na API: `verao2026`, `VERAO2026`, `  VERAO2026` e `VERAO2026  ` retornam “Cupom expirado.”. |
| 07 | 01-cupom-desconto.feature | Não é possível acumular dois cupons | CA05 | ui | Passou |  | `docs/dom-referencia/carrinho-cupom-aplicado.html` | A UI impede acumular: com cupom aplicado o campo de cupom some e só resta "Remover cupom". Confirmar visualmente na tela. |
| 08 | 01-cupom-desconto.feature | Trocar de cupom removendo o atual antes | CA05 | ui | Passou |  |  | Automatizado (UI): o campo some com cupom aplicado; "Remover cupom" restaura o resumo e o cupom expirado é recusado. |
| 09 | 01-cupom-desconto.feature | Reaplicar o mesmo cupom não duplica o desconto | CA05 | ui | Passou |  | `docs/dom-referencia/carrinho-cupom-aplicado.html` | Não é possível reaplicar o mesmo cupom: o campo fica oculto enquanto há cupom aplicado. |
| 10 | 01-cupom-desconto.feature | Alterar a quantidade com cupom aplicado recalcula o desconto e o total | BUG-001 | exploratório, ui, api | Falhou | BUG-001 | evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png | Com BEMVINDO10, aumentar de 1 para 2 mochilas recalcula o desconto de R$ 10,00 para R$ 20,00, mas cobra R$ 19,90 de frete no subtotal de R$ 200,00. Total obtido: R$ 199,90; esperado: R$ 180,00. |
| 11 | 01-cupom-desconto.feature | Remover todos os itens com cupom aplicado | - | exploratorio,ui | Passou |  |  | Ao remover o último item pelo botão “Remover”, o carrinho fica vazio e o cupom é removido. |
| 12 | 02-frete-gratis.feature | Frete conforme o subtotal (limite de R$ 200,00 inclusive) | CA06,CA07 | ui,api | Falhou | BUG-001 | `BUG-001-api-calcular-subtotal-200.png` | Linhas de R$ 200,00 falham (frete R$ 19,90). Demais linhas passam. |
| 13 | 02-frete-gratis.feature | Carrinho informa quanto falta para o frete grátis | CA07 | ui | Falhou | BUG-001 |  | Com 1 mochila, informa “Faltam R$ 100,00”. Com 2 mochilas (subtotal R$ 200,00), informa “Faltam R$ 0,00”, mas cobra frete de R$ 19,90; relacionado ao BUG-001. |
| 14 | 02-frete-gratis.feature | Ao atingir R$ 200,00 o aviso de "falta" deixa de ser exibido | CA06 | ui | Falhou | BUG-001 | `BUG-001-ui-frete-subtotal-200-sem-cupom.png` | Exibe "Faltam R$ 0,00 para o frete grátis" e cobra frete. |
| 15 | 02-frete-gratis.feature | Frete grátis considera o subtotal ANTES do desconto | CA08 | ui,api | Falhou | BUG-001 | `BUG-001-ui-frete-subtotal-200-com-cupom.png` | Total R$ 199,90; esperado R$ 180,00. Causa raiz no limite de R$ 200,00. |
| 16 | 02-frete-gratis.feature | Valor faltante não considera o desconto do cupom | CA08 | api | Passou |  |  | `POST /api/carrinho/calcular`, P005 × 1 com `BEMVINDO10`: subtotal R$ 100,00, desconto R$ 10,00, frete R$ 19,90 e `valorFaltanteFreteGratis: 100`. O valor faltante usa o subtotal antes do desconto. |
| 17 | 02-frete-gratis.feature | Desconto do cupom não incide sobre o frete | CA09 | ui,api | Passou |  | `BUG-001-ui-frete-subtotal-200-com-cupom.png` | Verificado com 2 mochilas: desconto de R$ 20,00 só sobre os produtos. |
| 18 | 02-frete-gratis.feature | Subtotal logo abaixo de R$ 200,00 mantém o frete mesmo com cupom | CA08 | api | A executar |  |  |  |
| 19 | 03-limite-quantidade.feature | Interface permite até 5 unidades do mesmo produto | CA10 | ui | Passou |  | `CA10-ui-limite-5-todos-produtos.png` | Os 8 produtos chegaram a 5 unidades. |
| 20 | 03-limite-quantidade.feature | Interface impede a 6ª unidade do mesmo produto | CA10 | ui | Passou |  | `CA10-ui-limite-5-todos-produtos.png` | Botão "+" desabilitado e "Limite de 5 unidades por produto.". |
| 21 | 03-limite-quantidade.feature | Interface impede aumentar a quantidade para além de 5 no carrinho | CA10 | ui | Passou |  | `CA10-ui-limite-5-todos-produtos.png` | Sem campo numérico; só botões "-" e "+". |
| 22 | 03-limite-quantidade.feature | API valida o limite de quantidade | CA10 | api | Falhou | BUG-002 | `BUG-002-api-calcular-quantidade-6.png` | 6, 12, 21 e 100 unidades aceitas (200). Valores inválidos (0, -1, 1.5, "2", null) retornam 422 corretamente. |
| 23 | 03-limite-quantidade.feature | API também aplica o limite ao confirmar o pedido | CA10 | api | Falhou | BUG-003 | `BUG-003-api-pedidos-quantidade-6.png` | 201 Created, pedido VZ-908998 com 6 unidades. |
| 24 | 03-limite-quantidade.feature | Mesmo produto repetido na lista é rejeitado como duplicado | CA10 | api | Passou |  |  | Repetir P004 (6+6, 3+2 e 1+0) retorna `ITEM_DUPLICADO`, com `campo: "itens[1].produtoId"`. |
| 25 | 04-calculo-total.feature | Total do carrinho com e sem cupom | CA01,CA06,CA07,CA08,CA09,CA11 | api,ui | Falhou | BUG-001 | `BUG-001-api-calcular-subtotal-200.png` | 8 de 10 linhas passam; falham #4 e #5 (subtotal R$ 200,00). |
| 26 | 04-calculo-total.feature | Valores monetários da resposta têm no máximo 2 casas decimais | CA11 | api | Passou |  |  | Automatizado (tests/api/calculo.spec.ts). |
| 27 | 04-calculo-total.feature | Cálculo não grava nada e é repetível | - | api | Passou |  |  | Automatizado. |
| 28 | 04-calculo-total.feature | Cupom é opcional no cálculo | - | api | Passou |  |  | Automatizado (linhas sem cupom da matriz). |
| 29 | 05-dados-do-cliente.feature | Pedido confirmado com dados válidos | - | ui,api | Passou |  | `MANUAL-ui-pedido-confirmado-5-camisetas.png` | Pedido VZ-298028 (UI). Na API, 201 com número no formato VZ-000000. |
| 30 | 05-dados-do-cliente.feature | Pedido com cupom válido confirma com desconto | - | api | Passou |  |  | Automatizado: resumo do pedido igual ao cálculo. |
| 31 | 05-dados-do-cliente.feature | Pedido com cupom inválido ou expirado é recusado | - | api | Passou |  |  | Automatizado: 422 CUPOM_INVALIDO e CUPOM_EXPIRADO. |
| 32 | 05-dados-do-cliente.feature | Validação do nome (precisa de nome e sobrenome) | - | ui,api | Parcial |  |  | UI e API passaram para "Maria", vazio e "Maria Silva" (automatizado). Falta "Maria de Souza". |
| 33 | 05-dados-do-cliente.feature | Nomes nos limites da regra | - | ui,api | A executar |  |  |  |
| 34 | 05-dados-do-cliente.feature | Validação do e-mail | - | ui,api | Parcial |  |  | UI recusa "maria", "maria@" e "@exemplo.com"; API recusa "maria" e "maria@" (automatizado). Faltam "maria exemplo.com", "maria@@exemplo.com". |
| 35 | 05-dados-do-cliente.feature | E-mails nos limites da regra | - | ui,api | A executar |  |  |  |
| 36 | 05-dados-do-cliente.feature | Validação do CEP (8 dígitos, com ou sem hífen) | - | ui,api | Parcial |  |  | UI e API: "01310-100" e "01310100" aceitos; "0131010", "013101000", "01310-1000" e "abcdefgh" recusados (automatizado). Faltam "0131-0100", "01310-10a" e vazio. |
| 37 | 05-dados-do-cliente.feature | Dados do cliente inválidos retornam DADOS_INVALIDOS | - | api | A executar |  |  |  |
| 38 | 05-dados-do-cliente.feature | CEP é devolvido normalizado na resposta do pedido | - | api | Passou |  | `BUG-003-api-pedidos-quantidade-6.png` | CEP devolvido sem hífen (01310100). Tratado como normalização intencional (ambiguidade #13). |
| 39 | 05-dados-do-cliente.feature | Não existe etapa de pagamento online | - | ui | Passou |  | `tests/ui/checkout.spec.ts` | O checkout pede só nome, e-mail e CEP e informa "O pagamento é feito na entrega."; não há etapa de pagamento online. |
| 40 | 06-api-contrato-e-erros.feature | Listar produtos | - |  | Passou |  |  | Automatizado. |
| 41 | 06-api-contrato-e-erros.feature | Consultar produto por id | - |  | Parcial |  |  | Automatizado só com P001. Faltam P008, P999 e p001. |
| 42 | 06-api-contrato-e-erros.feature | Produto inexistente retorna PRODUTO_NAO_ENCONTRADO no formato padrão de erro | - |  | Passou |  |  | Automatizado. |
| 43 | 06-api-contrato-e-erros.feature | Rota inexistente | - |  | Passou |  |  | Automatizado. |
| 44 | 06-api-contrato-e-erros.feature | Método HTTP não permitido | - |  | Parcial |  |  | Automatizado em 3 de 4 rotas. Falta DELETE /api/produtos/P001. |
| 45 | 06-api-contrato-e-erros.feature | Corpo com JSON malformado | - |  | Passou |  |  | Automatizado. |
| 46 | 06-api-contrato-e-erros.feature | Corpo que não é um objeto JSON | - | api | Passou |  |  | `[]`, `"teste"`, `123` e `null` retornam `JSON_INVALIDO`. `{}` é um objeto JSON válido e retorna `ITENS_OBRIGATORIOS`, portanto é um caso separado. |
| 47 | 06-api-contrato-e-erros.feature | Lista de itens ausente ou vazia | - |  | Passou |  |  | Automatizado. |
| 48 | 06-api-contrato-e-erros.feature | Item que não é um objeto válido | - | api | Falhou | BUG-004 |  | `["P001"]` e `null` retornam `ITEM_INVALIDO`. Porém, `itens: [{}]` reproduz `PRODUTO_NAO_ENCONTRADO`, mensagem “Produto undefined não encontrado.”, campo `itens[0].produtoId`, em vez de `ITEM_INVALIDO`. |
| 49 | 06-api-contrato-e-erros.feature | Item com produto inexistente | - | api | Passou |  |  | P009 retorna `PRODUTO_NAO_ENCONTRADO`, com `campo: "itens[1].produtoId"` quando o item inválido é o segundo da lista. |
| 50 | 06-api-contrato-e-erros.feature | Campo do erro aponta o item com problema | - |  | A executar |  |  |  |
| 51 | 06-api-contrato-e-erros.feature | Ordem de validação quando há mais de um problema | - | api | Passou |  |  | Resultado observado: quantidade inválida é reportada antes de produto inexistente; com quantidade válida, o produto inexistente é reportado. Cupom inválido é informado em `cupom.mensagem` sem impedir o cálculo. A documentação não define precedência; registrar como observação, não como bug. |
| 52 | 06-api-contrato-e-erros.feature | Cupom inválido ou expirado no cálculo não gera erro | - |  | Passou |  |  | Automatizado. |
| 53 | 06-api-contrato-e-erros.feature | Valores de cupom fora do padrão | - |  | A executar |  |  |  |
| 54 | 06-api-contrato-e-erros.feature | Código do cupom devolvido na resposta | - | api | Passou |  |  | Cupom válido retorna `codigo: "BEMVINDO10"` e `aplicado: true`; cupom inválido com espaços também foi observado com `codigo: ""` e `aplicado: false`. |
| 55 | 06-api-contrato-e-erros.feature | Resumo do pedido confirmado é igual ao cálculo do carrinho | - |  | Passou |  |  | Automatizado. |

## Nota de atualização

- **BUG-004** foi atribuído ao cenário 48 após reproduzir `itens: [{}]` e receber `PRODUTO_NAO_ENCONTRADO` com `Produto undefined não encontrado`, em vez de `ITEM_INVALIDO`. Confirmar/adicionar o registro correspondente em [`bugs.md`](bugs.md) antes do envio.
- O cenário 10 permanece sem alteração: reexecutar e reconciliar com BUG-001 se ainda houver divergência entre o status registrado e o resultado observado.

## Sessão exploratória

**Objetivo:** encontrar problemas em torno de cupom e frete que os critérios de aceite não cobrem diretamente.

**Duração:** 60 minutos

**Áreas exploradas:**
- Aplicação de cupons válidos, inválidos e expirados;
- Tratamento de espaços e diferenças entre letras maiúsculas e minúsculas;
- Cálculo do frete no limite de R$ 200,00;
- Cálculo do desconto sobre o subtotal;
- Validação de quantidades e estruturas inválidas nas requisições da API.

### Achados

- **BUG-001:** ao atingir exatamente R$ 200,00 de subtotal, o sistema cobra R$ 19,90 de frete, mesmo informando que não falta valor para obter frete grátis. Reproduzido na UI e na API, inclusive com o cupom `BEMVINDO10`.
- **BUG-002:** a API `POST /api/carrinho/calcular` aceita quantidades superiores a 5 unidades do mesmo produto.
- **BUG-003:** a API `POST /api/pedidos` confirma pedidos com mais de 5 unidades do mesmo produto.
- **BUG-004:** o envio de um item vazio (`{"itens":[{}]}`) retorna `PRODUTO_NAO_ENCONTRADO` e a mensagem `"Produto undefined não encontrado."`, enquanto outras estruturas inválidas retornam `ITEM_INVALIDO`. A expectativa para esse caso precisa ser confirmada com o contrato da API.

### Comportamentos verificados

- Cupons expirados foram rejeitados nas variações testadas;
- Cupons inválidos não concederam desconto;
- A API calculou corretamente o desconto de 10% no caso testado;
- Estruturas de requisição inválidas foram rejeitadas conforme os resultados registrados na execução manual.