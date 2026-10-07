import { test, expect } from '@playwright/test';
import { LojaPage } from '../support/loja.page';

// Cenário: 03-limite-quantidade.feature (CA10 na interface)
test('CA10 | interface permite 5 unidades e não passa disso', async ({ page }) => {
  const loja = new LojaPage(page);
  await loja.abrirProdutos();

  await loja.adicionarProduto('Boné Aba Curva', 5);
  await loja.irParaCarrinhoPeloMenu();
  await loja.esperarResumo({ subtotal: 'R$ 249,50' });

  // AJUSTAR: tentar a 6ª unidade pelo controle de quantidade do carrinho.
  // Comportamento esperado: a quantidade permanece 5 (a mensagem não está definida na doc).
  const quantidade = page.getByRole('spinbutton').first();
  await quantidade.fill('6');
  await quantidade.blur();
  await expect(quantidade).toHaveValue('5');
});
