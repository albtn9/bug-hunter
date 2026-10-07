# Ambiguidades e interpretações adotadas

Para cada ponto: o que a documentação diz, minha interpretação e o que foi observado na execução.

| # | Ponto | Interpretação adotada | Observado |
|---|---|---|---|
| 1 | CA11: regra de arredondamento (half up ou bancário?) | Arredondamento comercial (half up) a 2 casas. Com os preços e o cupom de 10% o resultado sempre cai em centavo exato; o risco é ruído de ponto flutuante (ex.: 59,9 × 3). | |
| 2 | CA05: o que acontece ao tentar um 2º cupom sem remover o 1º | O 2º cupom não é aplicado nem somado; o 1º permanece. A mensagem não está definida. | |
| 3 | CA04: fuso/data usados para "fora da validade" | Só há um cupom expirado (VERAO2026, 31/03/2026), então não dá para testar a borda da data. | |
| 4 | CA07: "quanto falta" usa subtotal antes ou depois do desconto? | Antes do desconto, coerente com o CA08. | |
| 5 | CA10: limite é por produto, não por pedido | 5 por produto; produtos diferentes somam livremente. | |
| 6 | CA10: tratamento de quantidade 0, negativa, decimal, texto, null | Todas inválidas (`QUANTIDADE_INVALIDA`), conforme a tabela de erros. | |
| 7 | CA02: espaço no meio do código | Só espaços no início e no fim são ignorados; "BEM VINDO10" é inválido. | |
| 8 | Cupom aplicado + alteração do carrinho | O desconto é recalculado com o novo subtotal. Se o carrinho esvazia, não há desconto. | |
| 9 | Itens repetidos cuja soma passa de 5 | Dúvida: `ITEM_DUPLICADO` ou `QUANTIDADE_MAXIMA_EXCEDIDA` vem primeiro? | |
| 10 | Precedência quando há vários erros no mesmo pedido | A doc não define a ordem de validação. | |
| 11 | Detalhes de `DADOS_INVALIDOS` | A doc cita "campos" (plural); o formato padrão de erro tem "campo". | |
| 12 | `cupom.codigo` na resposta | Normalizado ou como digitado? | |
| 13 | CEP devolvido sem hífen no pedido (`01310100`) | Considerado normalização intencional. | |
| 14 | Cupom vazio, null, número ou booleano | A doc não define; registrar o comportamento observado. | |
