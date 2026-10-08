# Ambiguidades e interpretações adotadas

Para cada ponto: o que a documentação diz, minha interpretação e o que foi observado na execução.

| # | Ponto | Interpretação adotada | Observado |
|---|---|---|---|
| 1 | CA11: regra de arredondamento (half up ou bancário?) | Arredondamento comercial (half up) a 2 casas. Com os preços e o cupom de 10% o resultado sempre cai em centavo exato; o risco é ruído de ponto flutuante (ex.: 59,9 × 3). | Casos com risco de ruído de ponto flutuante (59,9 × 3 e 29,9 × 5) retornaram valores com 2 casas (17,97 e 14,95). CA11 passou. |
| 2 | CA05: o que acontece ao tentar um 2º cupom sem remover o 1º | O 2º cupom não é aplicado nem somado; o 1º permanece. A mensagem não está definida. | UI: com cupom aplicado o campo de cupom some e só resta "Remover cupom". A API recebe um único cupom por chamada. |
| 3 | CA04: fuso/data usados para "fora da validade" | Só há um cupom expirado (VERAO2026, 31/03/2026), então não dá para testar a borda da data. | Não verificável: só existe um cupom expirado (VERAO2026). |
| 4 | CA07: "quanto falta" usa subtotal antes ou depois do desconto? | Antes do desconto, coerente com o CA08. | Antes do desconto: P005 × 1 mostra "faltam R$ 100,00" com e sem BEMVINDO10. |
| 5 | CA10: limite é por produto, não por pedido | 5 por produto; produtos diferentes somam livremente. | UI: 5 unidades em cada um dos 8 produtos (40 itens no carrinho). API: não limita (BUG-002 e BUG-003). |
| 6 | CA10: tratamento de quantidade 0, negativa, decimal, texto, null | Todas inválidas (`QUANTIDADE_INVALIDA`), conforme a tabela de erros. | API: 0, -1, 1.5, "2" e null retornam 422 QUANTIDADE_INVALIDA; item sem quantidade também. |
| 7 | CA02: espaço no meio do código | Só espaços no início e no fim são ignorados; "BEM VINDO10" é inválido. | |
| 8 | Cupom aplicado + alteração do carrinho | O desconto é recalculado com o novo subtotal. Se o carrinho esvazia, não há desconto. | UI: aumentar a quantidade com cupom aplicado recalcula o desconto (R$ 10,00 → R$ 20,00). |
| 9 | Itens repetidos cuja soma passa de 5 | Dúvida: `ITEM_DUPLICADO` ou `QUANTIDADE_MAXIMA_EXCEDIDA` vem primeiro? | |
| 10 | Precedência quando há vários erros no mesmo pedido | A doc não define a ordem de validação. | |
| 11 | Detalhes de `DADOS_INVALIDOS` | A doc cita "campos" (plural); o formato padrão de erro tem "campo". | Resolvido: o 422 DADOS_INVALIDOS devolve "campos", uma lista de {campo, mensagem}, como a documentação descreve. |
| 12 | `cupom.codigo` na resposta | Normalizado ou como digitado? | API: o código volta sem espaços nas pontas (" " → "") e como texto (123 → "123"). A caixa não foi verificada na API. |
| 13 | CEP devolvido sem hífen no pedido (`01310100`) | Considerado normalização intencional. | Confirmado em /api/pedidos: o CEP volta como "01310100" (sem hífen). |
| 14 | Cupom vazio, null, número ou booleano | A doc não define; registrar o comportamento observado. | "" e null → 200 sem cupom (cupom: null). 123 e true → 200, convertidos para texto e tratados como "Cupom inválido.". " " → "Cupom inválido." com codigo "" (diferente de ""). |
| 15 | Nome: tamanho mínimo e caracteres aceitos | "Nome e sobrenome" = duas palavras separadas por espaço; a documentação não define tamanho mínimo nem caracteres permitidos. | " Maria " recusado (espaços ignorados); "Maria S" recusado (sobrenome de 1 letra); "Maria  Silva" aceito e devolvido com 2 espaços; "123 456" aceito (números como nome). |
| 16 | E-mail: espaço no início e extensão do domínio | A documentação só exige formato válido. | "maria@exemplo" recusado (exige ponto no domínio); "maria@exemplo.c" aceito (extensão de 1 letra); " maria@exemplo.com" aceito. |
