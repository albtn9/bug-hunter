# Uso de IA

Usei o **Claude (Anthropic), pelo chat**, como apoio em boa parte do teste. A IA não acessou a loja nem a API: trabalhou com a documentação e o que eu colei na conversa (HTML das telas, respostas do Postman, prints e saída dos testes). Toda a execução contra a Verzel Store foi feita por mim.

## O que a IA produziu (e eu revisei)

- plano de execução e estrutura do repositório;
- rascunho dos cenários em Gherkin (português), incluindo a matriz de valores esperados do cálculo, conferida com um script independente;
- código da automação com Playwright: configuração, specs de API e de UI, page objects e fixtures;
- análise das falhas dos testes, para separar bug da aplicação de erro do teste;
- rascunhos dos documentos (bugs, evidências, execução manual) e revisão do repositório antes do envio.

## O que eu fiz

- li a documentação e separei comportamento esperado de possível bug;
- testei a loja manualmente e tirei os prints;
- chamei a API no Postman e guardei as respostas;
- copiei o HTML das telas e o `sessionStorage` para os seletores;
- rodei as suítes, conferi as falhas e ajustei o que a IA sugeriu;
- encontrei e documentei o BUG-004 na exploração da API;
- organizei as evidências e os commits.

## Limites

- A IA não executou testes contra a loja; os resultados vêm das minhas execuções.
- Testes de carga, estresse e segurança ficaram fora do escopo.