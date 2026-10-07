# language: pt
@cliente
Funcionalidade: Validação dos dados do cliente no pedido (regras pré-existentes)
  Pagamento é feito na entrega; não existe etapa de pagamento online.

  Contexto:
    Dado que tenho um carrinho com 1 unidade de "Mochila Urbana 20L"

  @ui @api @automatizado
  Cenário: Pedido confirmado com dados válidos
    Quando confirmo o pedido com nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
    Então o pedido é confirmado com número no formato "VZ-000000"
    E o resumo mostra total "R$ 119,90"

  @api
  Cenário: Pedido com cupom válido confirma com desconto
    Quando confirmo o pedido com cupom "BEMVINDO10"
    Então a resposta tem status 201
    E o total é 109.90

  @api
  Esquema do Cenário: Pedido com cupom inválido ou expirado é recusado
    Quando confirmo o pedido com cupom "<cupom>"
    Então a resposta tem status 422
    E o código de erro é "<codigo>"

    Exemplos:
      | cupom      | codigo         |
      | XPTO99     | CUPOM_INVALIDO |
      | VERAO2026  | CUPOM_EXPIRADO |

  @ui @api
  Esquema do Cenário: Validação do nome (precisa de nome e sobrenome)
    Quando confirmo o pedido com nome "<nome>", e-mail "maria@exemplo.com" e CEP "01310-100"
    Então o pedido é <resultado>

    Exemplos:
      | nome            | resultado  |
      | Maria Silva     | confirmado |
      | Maria de Souza  | confirmado |
      | Maria           | recusado   |
      |                 | recusado   |

  @ui @api @ambiguidade
  Esquema do Cenário: Nomes nos limites da regra
    # Convenção: "·" representa um espaço. A doc não define estes casos.
    Quando confirmo o pedido com nome "<nome>", e-mail "maria@exemplo.com" e CEP "01310-100"
    Então registro o resultado observado

    Exemplos:
      | nome         |
      | ·Maria·      |
      | Maria··Silva |
      | Maria·S      |
      | 123·456      |

  @ui @api
  Esquema do Cenário: Validação do e-mail
    Quando confirmo o pedido com nome "Maria Silva", e-mail "<email>" e CEP "01310-100"
    Então o pedido é <resultado>

    Exemplos:
      | email               | resultado  |
      | maria@exemplo.com   | confirmado |
      | maria               | recusado   |
      | maria@              | recusado   |
      | @exemplo.com        | recusado   |
      | maria exemplo.com   | recusado   |
      | maria@@exemplo.com  | recusado   |

  @ui @api @ambiguidade
  Esquema do Cenário: E-mails nos limites da regra
    Quando confirmo o pedido com nome "Maria Silva", e-mail "<email>" e CEP "01310-100"
    Então registro o resultado observado

    Exemplos:
      | email              |
      | maria@exemplo      |
      | maria@exemplo.c    |
      | ·maria@exemplo.com |

  @ui @api @automatizado
  Esquema do Cenário: Validação do CEP (8 dígitos, com ou sem hífen)
    Quando confirmo o pedido com nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "<cep>"
    Então o pedido é <resultado>

    Exemplos:
      | cep         | resultado  |
      | 01310-100   | confirmado |
      | 01310100    | confirmado |
      | 0131010     | recusado   |
      | 013101000   | recusado   |
      | 01310-1000  | recusado   |
      | 0131-0100   | recusado   |
      | abcdefgh    | recusado   |
      | 01310-10a   | recusado   |
      |             | recusado   |

  @api
  Cenário: Dados do cliente inválidos retornam DADOS_INVALIDOS
    # Dúvida: a doc cita detalhes em "campos" (plural); o formato padrão de erro tem "campo".
    Quando confirmo o pedido com nome "Maria", e-mail "maria" e CEP "123"
    Então a resposta tem status 422
    E o código de erro é "DADOS_INVALIDOS"
    E os detalhes dos três campos inválidos são informados

  @api @ambiguidade
  Cenário: CEP é devolvido normalizado na resposta do pedido
    Quando confirmo o pedido com nome "Maria Silva", e-mail "maria@exemplo.com" e CEP "01310-100"
    Então o CEP na resposta é "01310100"

  @ui
  Cenário: Não existe etapa de pagamento online
    Quando chego à confirmação do pedido
    Então não é solicitado nenhum dado de pagamento
