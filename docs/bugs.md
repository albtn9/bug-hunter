# Report de bugs

Antes de reportar, conferi a seção "Sobre este ambiente" da documentação (carrinho só na aba, pedidos não armazenados,
sem e-mail/cobrança, dados fixos, API sem estado). Nenhum dos bugs abaixo se enquadra nesses comportamentos esperados.

Ambiente: Verzel Store v2.3.0 (card VZS-142), Chrome, execução em outubro/2026.

## Resumo

| ID | Título | Severidade | Prioridade | Critério | Onde |
|---|---|---|---|---|---|
| BUG-001 | Frete cobrado quando o subtotal é exatamente R$ 200,00 | Alta | Alta | CA06, CA08 | UI e API |
| BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto | Média | Média | CA10 | API |
| BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto | Alta | Alta | CA10 | API |

---

## BUG-001 | Frete cobrado quando o subtotal é exatamente R$ 200,00

- **Severidade / Prioridade:** Alta / Alta (regra de dinheiro: o cliente paga R$ 19,90 a mais)
- **Critérios de aceite:** CA06 ("frete grátis a partir de R$ 200,00, **inclusive**"), CA08 (regra considera o subtotal antes do cupom)
- **Onde:** UI (carrinho) e API `POST /api/carrinho/calcular`
- **Pré-condições:** carrinho vazio; sem cupom

**Passos para reproduzir**

1. Na lista de produtos, adicionar 2 unidades de "Mochila Urbana 20L" (R$ 100,00 cada).
2. Abrir o carrinho.
3. (Opcional) Aplicar o cupom `BEMVINDO10`.

**Resultado esperado**

- Sem cupom: subtotal R$ 200,00, frete R$ 0,00 (grátis), total R$ 200,00.
- Com `BEMVINDO10`: desconto R$ 20,00, frete R$ 0,00, total R$ 180,00.

**Resultado obtido**

- Sem cupom: subtotal R$ 200,00, frete **R$ 19,90**, total **R$ 219,90**.
- Com `BEMVINDO10`: desconto R$ 20,00, frete **R$ 19,90**, total **R$ 199,90**.
- A própria tela exibe "Faltam R$ 0,00 para o frete grátis", contradizendo a cobrança do frete.

**Análise**

- O desconto está correto (R$ 20,00); o erro está só na regra do frete.
- O "valor que falta" é calculado com `>= 200` (resulta em 0) e a regra do frete parece usar `> 200`. As duas regras se contradizem.
- Valores acima de R$ 200,00 (R$ 206,91, R$ 215,73, R$ 229,90) calculam o frete grátis corretamente, o que isola o defeito no limite exato.
- Reproduzido também com `P008 × 4` (R$ 200,00).

**Evidências**

- `evidencias/BUG-001-ui-frete-subtotal-200.png`
- `evidencias/BUG-001-ui-frete-subtotal-200-com-cupom.png`
- Testes automatizados que falham: `tests/api/calculo.spec.ts` (casos #4 e #5) e `tests/api/frete-limite.spec.ts`

---

## BUG-002 | `/api/carrinho/calcular` aceita mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Média / Média (a interface bloqueia o limite; o defeito só aparece em chamadas diretas à API)
- **Critério de aceite:** CA10 ("a regra vale para a interface e para a API")
- **Onde:** API `POST /api/carrinho/calcular`

**Passos para reproduzir**

1. Enviar `POST /api/carrinho/calcular` com `Content-Type: application/json` e o corpo:

```json
{ "itens": [{ "produtoId": "P004", "quantidade": 6 }] }
```

2. Repetir com `"quantidade": 100`.

**Resultado esperado**

- Status 422 com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"` e `erro.campo = "itens[0].quantidade"`.

**Resultado obtido**

- Status **200**, a API calcula o carrinho normalmente com a quantidade acima do limite.
- Subtotal devolvido para 6 unidades: `[preencher]`; para 100 unidades: `[preencher]`.

**Observações**

- Com `quantidade: 5` a resposta é 200 (correto). Valores inválidos como 0, -1, 1.5, "2" e null retornam 422 `QUANTIDADE_INVALIDA` (correto).
- Na interface, o botão "+" fica desabilitado em 5 unidades e aparece "Limite de 5 unidades por produto." (passou em todos os 8 produtos).

**Evidências**

- `evidencias/BUG-002-api-calcular-quantidade-6.png` (resposta da chamada)
- Testes automatizados que falham: `tests/api/cupom-e-quantidade.spec.ts` ("quantidade 6 é recusada" e "quantidade 100 é recusada")

---

## BUG-003 | `/api/pedidos` confirma pedido com mais de 5 unidades do mesmo produto

- **Severidade / Prioridade:** Alta / Alta (o pedido é efetivamente confirmado fora da regra de negócio)
- **Critério de aceite:** CA10
- **Onde:** API `POST /api/pedidos`
- **Relacionado:** BUG-002 (mesma regra, rota diferente)

**Passos para reproduzir**

1. Enviar `POST /api/pedidos` com o corpo:

```json
{
  "cliente": { "nome": "Maria Silva", "email": "maria@exemplo.com", "cep": "01310-100" },
  "itens": [{ "produtoId": "P004", "quantidade": 6 }]
}
```

**Resultado esperado**

- Status 422 com `erro.codigo = "QUANTIDADE_MAXIMA_EXCEDIDA"`; nenhum pedido confirmado.

**Resultado obtido**

- Status **201**, com número de pedido gerado (`VZ-......`): `[preencher o número devolvido]`.

**Evidências**

- `evidencias/BUG-003-api-pedidos-quantidade-6.png`
- Teste automatizado que falha: `tests/api/cupom-e-quantidade.spec.ts` ("limite também vale ao confirmar o pedido")

---

## Observação sobre o que passou

Os critérios CA01, CA02, CA03, CA04, CA07 e CA09, o cálculo dos demais casos da matriz (8 de 10), a validação de quantidades inválidas e o limite de 5 unidades na interface passaram sem divergência.
