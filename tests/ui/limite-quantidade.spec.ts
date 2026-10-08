import { PRODUTOS } from '../support/dados';
import { expect, test } from '../support/fixtures';

// Cenário: docs/cenarios/03-limite-quantidade.feature (CA10 na interface)
const bone = PRODUTOS.P004.nome;

test('CA10 | interface bloqueia a 6ª unidade do mesmo produto', async ({ carrinhoCom, carrinho }) => {
  await carrinhoCom([{ produtoId: 'P004', quantidade: 4 }]);

  await carrinho.botaoAumentar(bone).click();

  await expect(carrinho.quantidade(bone)).toHaveText('5');
  await expect(carrinho.botaoAumentar(bone)).toBeDisabled();
  await expect(carrinho.avisoLimite(bone)).toBeVisible();
  await carrinho.esperarResumo({ subtotal: 'R$ 249,50' });
});
