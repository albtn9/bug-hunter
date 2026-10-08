# language: pt
@cupom
Funcionalidade: Aplicação de cupom de desconto no carrinho
  Como cliente da Verzel Store
  Quero aplicar um cupom de desconto
  Para pagar menos nas minhas compras

  Contexto:
    Dado que estou na Verzel Store com o carrinho vazio

  @CA01 @ui @automatizado
  Cenário: Cupom BEMVINDO10 aplica 10% de desconto sobre o subtotal
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "BEMVINDO10"
    Então o subtotal exibido é "R$ 100,00"
    E o desconto exibido é "R$ 10,00"
    E o frete exibido é "R$ 19,90"
    E o total exibido é "R$ 109,90"
    E vejo o cupom "BEMVINDO10" marcado como aplicado

  @CA02 @ui @api @automatizado
  Esquema do Cenário: Código do cupom ignora maiúsculas/minúsculas e espaços nas pontas
    # Convenção: "·" representa um espaço (o Gherkin remove espaços nas pontas das células).
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "<codigo>"
    Então o desconto exibido é "R$ 10,00"

    Exemplos:
      | codigo           |
      | BEMVINDO10       |
      | bemvindo10       |
      | BemVindo10       |
      | ··BEMVINDO10     |
      | BEMVINDO10··     |
      | ·bemvindo10·     |

  @CA02 @ui @api @ambiguidade
  Esquema do Cenário: Códigos com espaço no meio ou vazios não aplicam desconto
    # Interpretação: só espaços no INÍCIO e no FIM são ignorados (CA02).
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "<codigo>"
    Então nenhum desconto é aplicado

    Exemplos:
      | codigo        |
      | BEM VINDO10   |
      | BEMVINDO 10   |
      | BEMVINDO1     |
      | BEMVINDO100   |

  @CA03 @ui @api @automatizado
  Cenário: Cupom inexistente exibe "Cupom inválido." e não desconta
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "XPTO99"
    Então vejo a mensagem "Cupom inválido."
    E nenhum desconto é aplicado
    E o total exibido é "R$ 119,90"

  @CA04 @ui @api @automatizado
  Cenário: Cupom expirado exibe "Cupom expirado." e não desconta
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "VERAO2026"
    Então vejo a mensagem "Cupom expirado."
    E nenhum desconto é aplicado
    E o total exibido é "R$ 119,90"

  @CA04 @ui
  Cenário: Cupom expirado também respeita maiúsculas/minúsculas e espaços
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    Quando aplico o cupom "  verao2026 "
    Então vejo a mensagem "Cupom expirado."

  @CA05 @ui @ambiguidade
  Cenário: Não é possível acumular dois cupons
    # A doc não define a mensagem nem o comportamento exato ao tentar um 2º cupom.
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    E que o cupom "BEMVINDO10" está aplicado
    Quando tento aplicar o cupom "VERAO2026" sem remover o atual
    Então o cupom "BEMVINDO10" continua como o único cupom aplicado
    E o desconto exibido continua "R$ 10,00"

  @CA05 @ui
  Cenário: Trocar de cupom removendo o atual antes
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    E que o cupom "BEMVINDO10" está aplicado
    Quando removo o cupom atual
    Então nenhum desconto é aplicado
    E o total exibido é "R$ 119,90"
    Quando aplico o cupom "VERAO2026"
    Então vejo a mensagem "Cupom expirado."

  @CA05 @ui
  Cenário: Reaplicar o mesmo cupom não duplica o desconto
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    E que o cupom "BEMVINDO10" está aplicado
    Quando tento aplicar o cupom "BEMVINDO10" novamente
    Então o desconto exibido continua "R$ 10,00"

  @exploratorio @ui
  Cenário: Alterar a quantidade com cupom aplicado recalcula o desconto
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    E que o cupom "BEMVINDO10" está aplicado
    Quando aumento a quantidade de "Mochila Urbana 20L" para 2
    Então o subtotal exibido é "R$ 200,00"
    E o desconto exibido é "R$ 20,00"
    E o total exibido é "R$ 180,00"

  @exploratorio @ui @ambiguidade
  Cenário: Remover todos os itens com cupom aplicado
    Dado que adicionei 1 unidade de "Mochila Urbana 20L" ao carrinho
    E que o cupom "BEMVINDO10" está aplicado
    Quando removo "Mochila Urbana 20L" do carrinho
    Então o carrinho está vazio
    E nenhum desconto é exibido
