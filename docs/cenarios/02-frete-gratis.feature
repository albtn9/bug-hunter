# language: pt
@frete
Funcionalidade: Frete grátis e frete fixo
  Como cliente da Verzel Store
  Quero ganhar frete grátis em compras maiores
  Para pagar menos nas minhas compras

  Contexto:
    Dado que estou na Verzel Store com o carrinho vazio

  @CA06 @CA07 @ui @api @automatizado
  Esquema do Cenário: Frete conforme o subtotal (limite de R$ 200,00 inclusive)
    # Os preços são múltiplos de R$ 0,10, então 199,99 e 200,01 não são alcançáveis.
    # Os limites reais são 199,80 (abaixo) e 200,00 (exato).
    Dado que adicionei ao carrinho os itens "<itens>"
    Então o subtotal exibido é "<subtotal>"
    E o frete exibido é "<frete>"
    E o valor faltante para o frete grátis é "<faltante>"

    Exemplos:
      | itens                    | subtotal   | frete     | faltante   |
      | P004x1                   | R$ 49,90   | R$ 19,90  | R$ 150,10  |
      | P001x1                   | R$ 59,90   | R$ 19,90  | R$ 140,10  |
      | P003x1                   | R$ 189,90  | R$ 19,90  | R$ 10,10   |
      | P001x1, P002x1           | R$ 199,80  | R$ 19,90  | R$ 0,20    |
      | P005x2                   | R$ 200,00  | R$ 0,00   | R$ 0,00    |
      | P008x4                   | R$ 200,00  | R$ 0,00   | R$ 0,00    |
      | P007x1                   | R$ 229,90  | R$ 0,00   | R$ 0,00    |
      | P003x1, P006x1           | R$ 219,80  | R$ 0,00   | R$ 0,00    |

  @CA07 @ui
  Cenário: Carrinho informa quanto falta para o frete grátis
    Dado que adicionei 1 unidade de "Camiseta Essencial" ao carrinho
    Então vejo a informação de que faltam "R$ 140,10" para o frete grátis

  @CA06 @ui
  Cenário: Ao atingir R$ 200,00 o aviso de "falta" deixa de ser exibido
    Dado que adicionei 2 unidades de "Mochila Urbana 20L" ao carrinho
    Então o frete exibido é "R$ 0,00"
    E não vejo aviso de valor faltante para o frete grátis

  @CA08 @ui @api @automatizado
  Cenário: Frete grátis considera o subtotal ANTES do desconto
    # Subtotal 200,00 com cupom: produtos ficam em 180,00, mas o frete continua grátis.
    Dado que adicionei 2 unidades de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal exibido é "R$ 200,00"
    E o desconto exibido é "R$ 20,00"
    E o frete exibido é "R$ 0,00"
    E o total exibido é "R$ 180,00"

  @CA08 @api
  Cenário: Valor faltante não considera o desconto do cupom
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "BEMVINDO10"
    Então o valor faltante para o frete grátis é "R$ 100,00"

  @CA09 @ui @api @automatizado
  Cenário: Desconto do cupom não incide sobre o frete
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "BEMVINDO10"
    Então o desconto exibido é "R$ 10,00"
    E o frete exibido é "R$ 19,90"
    E o total exibido é "R$ 109,90"

  @CA08 @api
  Cenário: Subtotal logo abaixo de R$ 200,00 mantém o frete mesmo com cupom
    Dado que adicionei ao carrinho os itens "P001x1, P002x1"
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal exibido é "R$ 199,80"
    E o desconto exibido é "R$ 19,98"
    E o frete exibido é "R$ 19,90"
    E o total exibido é "R$ 199,72"
