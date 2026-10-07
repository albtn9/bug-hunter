# language: pt
@quantidade
Funcionalidade: Limite de 5 unidades por produto
  Como loja
  Quero limitar a 5 unidades por produto em cada pedido
  Para respeitar a regra de negócio na interface e na API

  @CA10 @ui @automatizado
  Cenário: Interface permite até 5 unidades do mesmo produto
    Dado que estou na Verzel Store com o carrinho vazio
    Quando adiciono 5 unidades de "Boné Aba Curva" ao carrinho
    Então a quantidade de "Boné Aba Curva" no carrinho é 5
    E o subtotal exibido é "R$ 249,50"

  @CA10 @ui @ambiguidade
  Cenário: Interface impede a 6ª unidade do mesmo produto
    # A doc não define a mensagem da interface; registrar o comportamento observado.
    Dado que o carrinho tem 5 unidades de "Boné Aba Curva"
    Quando tento adicionar mais 1 unidade de "Boné Aba Curva"
    Então a quantidade de "Boné Aba Curva" no carrinho continua 5

  @CA10 @ui
  Cenário: Interface impede aumentar a quantidade para além de 5 no carrinho
    Dado que o carrinho tem 5 unidades de "Boné Aba Curva"
    Quando tento aumentar a quantidade de "Boné Aba Curva" para 6
    Então a quantidade de "Boné Aba Curva" no carrinho continua 5

  @CA10 @api @automatizado
  Esquema do Cenário: API valida o limite de quantidade
    Quando calculo o carrinho com o produto "P004" na quantidade <quantidade>
    Então a resposta tem status <status>
    E o código de erro é "<codigo>"

    Exemplos:
      | quantidade | status | codigo                      |
      | 5          | 200    |                             |
      | 6          | 422    | QUANTIDADE_MAXIMA_EXCEDIDA  |
      | 100        | 422    | QUANTIDADE_MAXIMA_EXCEDIDA  |
      | 0          | 422    | QUANTIDADE_INVALIDA         |
      | -1         | 422    | QUANTIDADE_INVALIDA         |
      | 1.5        | 422    | QUANTIDADE_INVALIDA         |
      | "2"        | 422    | QUANTIDADE_INVALIDA         |
      | null       | 422    | QUANTIDADE_INVALIDA         |

  @CA10 @api
  Cenário: API também aplica o limite ao confirmar o pedido
    Quando confirmo um pedido com o produto "P004" na quantidade 6
    Então a resposta tem status 422
    E o código de erro é "QUANTIDADE_MAXIMA_EXCEDIDA"

  @CA10 @api @ambiguidade
  Cenário: Mesmo produto repetido na lista é rejeitado como duplicado
    # Dúvida: P004 3x + P004 3x (soma 6) retorna ITEM_DUPLICADO ou QUANTIDADE_MAXIMA_EXCEDIDA?
    Quando calculo o carrinho com os itens:
      | produtoId | quantidade |
      | P004      | 3          |
      | P004      | 3          |
    Então a resposta tem status 422
    E o código de erro é "ITEM_DUPLICADO"
