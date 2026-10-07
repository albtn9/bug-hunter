import { test, expect } from '@playwright/test';
import { LojaPage } from '../support/loja.page';

// Cenário: docs/cenarios/03-limite-quantidade.feature (CA10 na interface)
// O carrinho usa botões "−" e "+" (não há campo numérico). Na execução manual, o "+" ficou
// desabilitado em 5 unidades e a linha exibiu "Limite de 5 unidades por produto.".
test('CA10 | interface bloqueia a 6ª unidade do mesmo produto', async ({ page }) => {
  const loja = new LojaPage(page);
  await loja.abrirProdutos();
  await loja.adicionarProduto('Boné Aba Curva');
  await loja.irParaCarrinhoPeloMenu();

  // AJUSTAR: nome acessível do botão "+" (use `npx playwright codegen` para confirmar).
  const linha = page
    .locator('li, article, div')
    .filter({ hasText: 'Boné Aba Curva' })
    .filter({ has: page.getByRole('button', { name: /^\+$|aumentar|mais/i }) })
    .last();
  const mais = linha.getByRole('button', { name: /^\+$|aumentar|mais/i });

  for (let i = 0; i < 4; i++) {
    await mais.click();
  }

  await expect(mais).toBeDisabled();
  await expect(linha.getByText('Limite de 5 unidades por produto.')).toBeVisible();
  await loja.esperarResumo({ subtotal: 'R$ 249,50' });
});
