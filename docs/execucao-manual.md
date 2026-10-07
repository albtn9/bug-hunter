# Execução manual e exploratória

Preencher **Resultado** (Passou / Falhou / Bloqueado), data e evidência. Em caso de falha, referenciar o BUG em `bugs.md`.

| # | Arquivo | Cenário | CA | Tipo | Resultado | Bug | Evidência | Observações |
|---|---|---|---|---|---|---|---|---|
| 01 | 01-cupom-desconto.feature | Cupom BEMVINDO10 aplica 10% de desconto sobre o subtotal | CA01 | ui | | | | |
| 02 | 01-cupom-desconto.feature | Código do cupom ignora maiúsculas/minúsculas e espaços nas pontas | CA02 | ui,api | | | | |
| 03 | 01-cupom-desconto.feature | Códigos com espaço no meio ou vazios não aplicam desconto | CA02 | ui,api | | | | |
| 04 | 01-cupom-desconto.feature | Cupom inexistente exibe "Cupom inválido." e não desconta | CA03 | ui,api | | | | |
| 05 | 01-cupom-desconto.feature | Cupom expirado exibe "Cupom expirado." e não desconta | CA04 | ui,api | | | | |
| 06 | 01-cupom-desconto.feature | Cupom expirado também respeita maiúsculas/minúsculas e espaços | CA04 | ui | | | | |
| 07 | 01-cupom-desconto.feature | Não é possível acumular dois cupons | CA05 | ui | | | | |
| 08 | 01-cupom-desconto.feature | Trocar de cupom removendo o atual antes | CA05 | ui | | | | |
| 09 | 01-cupom-desconto.feature | Reaplicar o mesmo cupom não duplica o desconto | CA05 | ui | | | | |
| 10 | 01-cupom-desconto.feature | Alterar a quantidade com cupom aplicado recalcula o desconto | - | exploratorio,ui | | | | |
| 11 | 01-cupom-desconto.feature | Remover todos os itens com cupom aplicado | - | exploratorio,ui | | | | |
| 12 | 02-frete-gratis.feature | Frete conforme o subtotal (limite de R$ 200,00 inclusive) | CA06,CA07 | ui,api | | | | |
| 13 | 02-frete-gratis.feature | Carrinho informa quanto falta para o frete grátis | CA07 | ui | | | | |
| 14 | 02-frete-gratis.feature | Ao atingir R$ 200,00 o aviso de "falta" deixa de ser exibido | CA06 | ui | | | | |
| 15 | 02-frete-gratis.feature | Frete grátis considera o subtotal ANTES do desconto | CA08 | ui,api | | | | |
| 16 | 02-frete-gratis.feature | Valor faltante não considera o desconto do cupom | CA08 | api | | | | |
| 17 | 02-frete-gratis.feature | Desconto do cupom não incide sobre o frete | CA09 | ui,api | | | | |
| 18 | 02-frete-gratis.feature | Subtotal logo abaixo de R$ 200,00 mantém o frete mesmo com cupom | CA08 | api | | | | |
| 19 | 03-limite-quantidade.feature | Interface permite até 5 unidades do mesmo produto | CA10 | ui | | | | |
| 20 | 03-limite-quantidade.feature | Interface impede a 6ª unidade do mesmo produto | CA10 | ui | | | | |
| 21 | 03-limite-quantidade.feature | Interface impede aumentar a quantidade para além de 5 no carrinho | CA10 | ui | | | | |
| 22 | 03-limite-quantidade.feature | API valida o limite de quantidade | CA10 | api | | | | |
| 23 | 03-limite-quantidade.feature | API também aplica o limite ao confirmar o pedido | CA10 | api | | | | |
| 24 | 03-limite-quantidade.feature | Mesmo produto repetido na lista é rejeitado como duplicado | CA10 | api | | | | |
| 25 | 04-calculo-total.feature | Total do carrinho com e sem cupom | CA01,CA06,CA07,CA08,CA09,CA11 | api,ui | | | | |
| 26 | 04-calculo-total.feature | Valores monetários da resposta têm no máximo 2 casas decimais | CA11 | api | | | | |
| 27 | 04-calculo-total.feature | Cálculo não grava nada e é repetível | - | api | | | | |
| 28 | 04-calculo-total.feature | Cupom é opcional no cálculo | - | api | | | | |
| 29 | 05-dados-do-cliente.feature | Pedido confirmado com dados válidos | - | ui,api | | | | |
| 30 | 05-dados-do-cliente.feature | Pedido com cupom válido confirma com desconto | - | api | | | | |
| 31 | 05-dados-do-cliente.feature | Pedido com cupom inválido ou expirado é recusado | - | api | | | | |
| 32 | 05-dados-do-cliente.feature | Validação do nome (precisa de nome e sobrenome) | - | ui,api | | | | |
| 33 | 05-dados-do-cliente.feature | Nomes nos limites da regra | - | ui,api | | | | |
| 34 | 05-dados-do-cliente.feature | Validação do e-mail | - | ui,api | | | | |
| 35 | 05-dados-do-cliente.feature | E-mails nos limites da regra | - | ui,api | | | | |
| 36 | 05-dados-do-cliente.feature | Validação do CEP (8 dígitos, com ou sem hífen) | - | ui,api | | | | |
| 37 | 05-dados-do-cliente.feature | Dados do cliente inválidos retornam DADOS_INVALIDOS | - | api | | | | |
| 38 | 05-dados-do-cliente.feature | CEP é devolvido normalizado na resposta do pedido | - | api | | | | |
| 39 | 05-dados-do-cliente.feature | Não existe etapa de pagamento online | - | ui | | | | |
| 40 | 06-api-contrato-e-erros.feature | Listar produtos | - |  | | | | |
| 41 | 06-api-contrato-e-erros.feature | Consultar produto por id | - |  | | | | |
| 42 | 06-api-contrato-e-erros.feature | Produto inexistente retorna PRODUTO_NAO_ENCONTRADO no formato padrão de erro | - |  | | | | |
| 43 | 06-api-contrato-e-erros.feature | Rota inexistente | - |  | | | | |
| 44 | 06-api-contrato-e-erros.feature | Método HTTP não permitido | - |  | | | | |
| 45 | 06-api-contrato-e-erros.feature | Corpo com JSON malformado | - |  | | | | |
| 46 | 06-api-contrato-e-erros.feature | Corpo que não é um objeto JSON | - |  | | | | |
| 47 | 06-api-contrato-e-erros.feature | Lista de itens ausente ou vazia | - |  | | | | |
| 48 | 06-api-contrato-e-erros.feature | Item que não é um objeto válido | - |  | | | | |
| 49 | 06-api-contrato-e-erros.feature | Item com produto inexistente | - |  | | | | |
| 50 | 06-api-contrato-e-erros.feature | Campo do erro aponta o item com problema | - |  | | | | |
| 51 | 06-api-contrato-e-erros.feature | Ordem de validação quando há mais de um problema | - |  | | | | |
| 52 | 06-api-contrato-e-erros.feature | Cupom inválido ou expirado no cálculo não gera erro | - |  | | | | |
| 53 | 06-api-contrato-e-erros.feature | Valores de cupom fora do padrão | - |  | | | | |
| 54 | 06-api-contrato-e-erros.feature | Código do cupom devolvido na resposta | - |  | | | | |
| 55 | 06-api-contrato-e-erros.feature | Resumo do pedido confirmado é igual ao cálculo do carrinho | - |  | | | | |

## Sessão exploratória

- **Objetivo:**
- **Duração:**
- **Áreas exploradas:**
- **Achados:**
