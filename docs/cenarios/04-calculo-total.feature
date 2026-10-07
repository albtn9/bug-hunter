# language: pt
@calculo
Funcionalidade: Cálculo do total do pedido
  Fórmula da documentação: total = subtotal - desconto + frete
  Os valores esperados abaixo foram calculados à mão (oráculo independente da API).

  @CA01 @CA06 @CA07 @CA08 @CA09 @CA11 @api @ui @automatizado
  Esquema do Cenário: Total do carrinho com e sem cupom
    Dado que adicionei ao carrinho os itens "<itens>"
    E que o cupom aplicado é "<cupom>"
    Então o subtotal é <subtotal>
    E o desconto é <desconto>
    E o frete é <frete>
    E o valor faltante para o frete grátis é <faltante>
    E o total é <total>

    Exemplos:
      | itens             | cupom      | subtotal | desconto | frete | faltante | total  |
      | P005x1            |            | 100.00   | 0.00     | 19.90 | 100.00   | 119.90 |
      | P005x1            | BEMVINDO10 | 100.00   | 10.00    | 19.90 | 100.00   | 109.90 |
      | P001x1, P002x1    |            | 199.80   | 0.00     | 19.90 | 0.20     | 219.70 |
      | P005x2            |            | 200.00   | 0.00     | 0.00  | 0.00     | 200.00 |
      | P005x2            | BEMVINDO10 | 200.00   | 20.00    | 0.00  | 0.00     | 180.00 |
      | P001x3            | BEMVINDO10 | 179.70   | 17.97    | 19.90 | 20.30    | 181.63 |
      | P007x1            | BEMVINDO10 | 229.90   | 22.99    | 0.00  | 0.00     | 206.91 |
      | P002x1, P004x2    | BEMVINDO10 | 239.70   | 23.97    | 0.00  | 0.00     | 215.73 |
      | P006x5            | BEMVINDO10 | 149.50   | 14.95    | 19.90 | 50.50    | 154.45 |
      | P003x1            | BEMVINDO10 | 189.90   | 18.99    | 19.90 | 10.10    | 190.81 |

  @CA11 @api @ambiguidade
  Cenário: Valores monetários da resposta têm no máximo 2 casas decimais
    # Candidatos a ruído de ponto flutuante: P001x3 (59.9*3) e P006x5 (29.9*5).
    Quando calculo o carrinho com o produto "P001" na quantidade 3 e o cupom "BEMVINDO10"
    Então todos os valores monetários da resposta têm no máximo 2 casas decimais

  @api
  Cenário: Cálculo não grava nada e é repetível
    Quando calculo duas vezes o mesmo carrinho
    Então as duas respostas são idênticas

  @api
  Cenário: Cupom é opcional no cálculo
    Quando calculo o carrinho com o produto "P005" na quantidade 1 sem informar cupom
    Então a resposta tem status 200
    E o desconto é 0.00
