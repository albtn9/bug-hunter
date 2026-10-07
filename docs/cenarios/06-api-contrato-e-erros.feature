# language: pt
@api
Funcionalidade: Contrato da API e códigos de erro
  A API fica em /api, recebe e responde JSON.

  @automatizado
  Cenário: Listar produtos
    Quando consulto GET "/api/produtos"
    Então a resposta tem status 200
    E a lista tem 8 produtos
    E cada produto tem "id", "nome", "descricao", "categoria" e "preco"
    E os preços batem com a tabela de dados de teste da documentação

  Esquema do Cenário: Consultar produto por id
    Quando consulto GET "/api/produtos/<id>"
    Então a resposta tem status <status>

    Exemplos:
      | id    | status |
      | P001  | 200    |
      | P008  | 200    |
      | P999  | 404    |
      | p001  | 404    |

  Cenário: Produto inexistente retorna PRODUTO_NAO_ENCONTRADO no formato padrão de erro
    Quando consulto GET "/api/produtos/P999"
    Então o código de erro é "PRODUTO_NAO_ENCONTRADO"
    E a resposta tem "erro.mensagem"

  Cenário: Rota inexistente
    Quando consulto GET "/api/xyz"
    Então a resposta tem status 404
    E o código de erro é "ROTA_NAO_ENCONTRADA"

  Esquema do Cenário: Método HTTP não permitido
    Quando envio <metodo> para "<rota>"
    Então a resposta tem status 405
    E o código de erro é "METODO_NAO_PERMITIDO"

    Exemplos:
      | metodo | rota                    |
      | GET    | /api/carrinho/calcular  |
      | GET    | /api/pedidos            |
      | POST   | /api/produtos           |
      | DELETE | /api/produtos/P001      |

  Cenário: Corpo com JSON malformado
    Quando envio POST para "/api/carrinho/calcular" com o corpo "{itens: "
    Então a resposta tem status 400
    E o código de erro é "JSON_INVALIDO"

  Esquema do Cenário: Corpo que não é um objeto JSON
    Quando envio POST para "/api/carrinho/calcular" com o corpo "<corpo>"
    Então a resposta tem status 400
    E o código de erro é "JSON_INVALIDO"

    Exemplos:
      | corpo      |
      | []         |
      | "texto"    |
      | 123        |
      | null       |

  Esquema do Cenário: Lista de itens ausente ou vazia
    Quando calculo o carrinho com o corpo "<corpo>"
    Então a resposta tem status 422
    E o código de erro é "ITENS_OBRIGATORIOS"

    Exemplos:
      | corpo            |
      | {}               |
      | {"itens": []}    |

  Esquema do Cenário: Item que não é um objeto válido
    Quando calculo o carrinho com o corpo "<corpo>"
    Então a resposta tem status 422
    E o código de erro é "ITEM_INVALIDO"

    Exemplos:
      | corpo                                 |
      | {"itens": ["P001"]}                   |
      | {"itens": [null]}                     |
      | {"itens": [{"produtoId": "P001"}]}    |
      | {"itens": [{"quantidade": 1}]}        |

  Cenário: Item com produto inexistente
    Quando calculo o carrinho com o produto "P999" na quantidade 1
    Então a resposta tem status 422
    E o código de erro é "PRODUTO_NAO_ENCONTRADO"
    E o campo informado é "itens[0].produtoId"

  Cenário: Campo do erro aponta o item com problema
    Quando calculo o carrinho com os itens:
      | produtoId | quantidade |
      | P001      | 1          |
      | P002      | 0          |
    Então o código de erro é "QUANTIDADE_INVALIDA"
    E o campo informado é "itens[1].quantidade"

  @ambiguidade
  Cenário: Ordem de validação quando há mais de um problema
    # A doc não define a precedência. Registrar o que a API devolve.
    Quando calculo o carrinho com o produto "P004" na quantidade 6 e o cupom "XPTO99"
    Então registro o código de erro observado

  @automatizado
  Cenário: Cupom inválido ou expirado no cálculo não gera erro
    Quando calculo o carrinho com o produto "P005" na quantidade 1 e o cupom "VERAO2026"
    Então a resposta tem status 200
    E "cupom.aplicado" é falso
    E "cupom.mensagem" é "Cupom expirado."
    E o desconto é 0.00

  @ambiguidade
  Esquema do Cenário: Valores de cupom fora do padrão
    Quando calculo o carrinho com o produto "P005" na quantidade 1 e o cupom <cupom>
    Então registro o status e a mensagem observados

    Exemplos:
      | cupom      |
      | ""         |
      | null       |
      | 123        |
      | " "        |
      | true       |

  @ambiguidade
  Cenário: Código do cupom devolvido na resposta
    Quando calculo o carrinho com o produto "P005" na quantidade 1 e o cupom " bemvindo10 "
    Então registro como "cupom.codigo" é devolvido (normalizado ou como digitado)

  Cenário: Resumo do pedido confirmado é igual ao cálculo do carrinho
    Quando calculo e depois confirmo o mesmo carrinho com cupom "BEMVINDO10"
    Então subtotal, desconto, frete, freteGratis, valorFaltanteFreteGratis e total são idênticos
