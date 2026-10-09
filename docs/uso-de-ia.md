# Uso de IA

Ferramenta e abordagem
Usei o **Claude (Anthropic),, por meio do chat**, como ferramenta de apoio em diferentes etapas do teste técnico: VZS-142 — cupom de desconto e frete grátis.

A IA não acessou diretamente a loja nem a API. As análises foram realizadas a partir da documentação, do HTML das telas, das respostas obtidas no Postman, das capturas de tela e das saídas dos testes que compartilhei durante o desenvolvimento. Toda a execução contra a Verzel Store foi realizada por mim.

A IA foi utilizada como apoio à análise, elaboração e revisão dos artefatos. As sugestões não foram consideradas corretas automaticamente: foram avaliadas conforme os requisitos, o comportamento observado e os resultados das execuções.

## Onde a IA contribuiu

 - Planejamento: estruturação do plano de execução e organização do repositório.
 - Cenários de teste: elaboração de rascunhos em Gherkin, em português, contemplando fluxos positivos, negativos e valores-limite.
 - Cálculos esperados: apoio na elaboração da matriz de valores esperados para subtotal, desconto, frete e total, conferida com um script independente.
 - Automação: geração e revisão do código com Playwright, incluindo configuração, testes de API e UI, Page Objects e fixtures.
 - Análise de falhas: apoio na investigação dos resultados para distinguir defeitos da aplicação, problemas nos testes e comportamentos que exigiam esclarecimento.
 - Documentação: elaboração e revisão dos relatórios de bugs, evidências, execução manual, ambiguidades e uso de IA.
 - Revisão técnica: apoio na organização dos arquivos, consistência dos registros e preparação do repositório para entrega.

## Estratégia de testes e técnicas aplicadas

A estratégia foi orientada pelos critérios de aceite e pelos riscos funcionais da entrega, priorizando os cálculos financeiros, a aplicação de cupons, a regra de frete grátis e o limite de quantidade por produto.

As técnicas utilizadas incluíram:

 - Análise de valores-limite: verificação do comportamento em torno do subtotal de R$ 200,00 e do limite de cinco unidades por produto.
 - Classes de equivalência: avaliação de entradas válidas e inválidas, como cupons aceitos, inválidos ou expirados e dados cadastrais em diferentes formatos.
 - Testes negativos e de validação: envio de quantidades inválidas, produtos inexistentes, dados incompletos e valores inesperados nos campos da API.
 - Testes de contrato da API: verificação de códigos HTTP, estrutura das respostas, mensagens de erro e campos retornados.
 - Testes comparativos entre UI e API: investigação de regras que precisam manter o mesmo comportamento nas duas interfaces.
 - Testes exploratórios: investigação de combinações e entradas não totalmente especificadas, registrando o comportamento observado e separando defeitos reproduzíveis de ambiguidades nos requisitos.

A IA auxiliou na elaboração e revisão de cenários, mas a seleção final, a execução e a confirmação dos resultados dependeram da análise e das evidências coletadas durante o teste.

## Mitigação de riscos e investigação de defeitos

Para reduzir o risco de conclusões incorretas, os resultados foram confrontados com os requisitos disponíveis e, quando aplicável, comparados entre a interface e a API.

Os cálculos esperados foram conferidos independentemente, e as falhas da automação foram analisadas antes de serem associadas a defeitos da aplicação. Os problemas identificados foram documentados com passos de reprodução, resultado observado, comportamento esperado quando definido e evidências.

Quando a documentação não estabelecia claramente o comportamento esperado, a situação foi registrada como ambiguidade, evitando classificar automaticamente toda diferença observada como bug.

A investigação exploratória também contribuiu para identificar o BUG-004, relacionado à resposta da API ao receber um item vazio. Esse caso evidencia a importância de examinar entradas fora dos fluxos usuais e distinguir a resposta observada da regra que ainda precisa ser confirmada.

## Manutenibilidade e evolução da automação

A estrutura da automação foi organizada para facilitar a leitura, a reutilização e a manutenção:

 - Page Objects: centralizam seletores e interações da interface, reduzindo a duplicação nos testes de UI.
 - Fixtures: facilitam a preparação de cenários e a montagem do carrinho.
 - Separação entre API e UI: permite executar e investigar cada conjunto de testes de forma independente.
 - Cenários em Gherkin: documentam o comportamento de negócio esperado em linguagem acessível.
 - Evidências e relatório de bugs: permitem relacionar resultados, requisitos e defeitos identificados.

Essa organização facilita futuras alterações na interface, a inclusão de novos cenários e a investigação de regressões. Quando uma mudança de interface afeta seletores ou interações, os Page Objects oferecem um ponto central de manutenção

## Responsabilidades e validação humana

Minha atuação no projeto incluiu:

 - leitura da documentação e interpretação dos critérios de aceite;
 - execução manual da loja e captura de evidências;
 - chamadas à API pelo Postman e registro das respostas;
 - inspeção do HTML das telas e do sessionStorage para apoiar a identificação de seletores;
 - execução das suítes automatizadas, análise das falhas e ajustes no código;
 - investigação e documentação do BUG-004 durante a exploração da API;
 - organização das evidências, documentação e commits.

A IA contribuiu com sugestões e produção de rascunhos, mas não substituiu a execução dos testes, a análise crítica dos resultados nem a responsabilidade pela entrega.

## Limitações e escopo

A IA não executou testes diretamente contra a loja ou a API. Os resultados registrados correspondem às execuções realizadas por mim no ambiente de teste.

Testes de carga, estresse e segurança ficaram fora do escopo deste projeto. A ausência dessas atividades não representa evidência de que a aplicação esteja livre de riscos nessas áreas.

As conclusões estão limitadas aos requisitos disponíveis, ao ambiente utilizado e aos cenários efetivamente executados e documentados.