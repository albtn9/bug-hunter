import { test } from '@playwright/test';
import { LojaPage } from '../support/loja.page';

// Cenários: 01-cupom-desconto.feature, 02-frete-gratis.feature (tags @ui @automatizado)
test.describe('UI | cupom de desconto e frete grátis', () => {
  let loja: LojaPage;

  test.beforeEach(async ({ page }) => {
    loja = new LojaPage(page);
    await loja.abrirProdutos();
  });

  test('CA01 | BEMVINDO10 desconta 10% do subtotal', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L');
    await loja.irParaCarrinhoPeloMenu();
    await loja.aplicarCupom('BEMVINDO10');

    await loja.esperarMensagem('Cupom aplicado: 10% de desconto nos produtos.');
    await loja.esperarResumo({ subtotal: 'R$ 100,00', desconto: 'R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' });
  });

  test('CA02 | código ignora caixa e espaços nas pontas', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L');
    await loja.irParaCarrinhoPeloMenu();
    await loja.aplicarCupom('  bemvindo10 ');

    await loja.esperarResumo({ desconto: 'R$ 10,00' });
  });

  test('CA03 | cupom inexistente exibe "Cupom inválido."', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L');
    await loja.irParaCarrinhoPeloMenu();
    await loja.aplicarCupom('XPTO99');

    await loja.esperarMensagem('Cupom inválido.');
    await loja.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 119,90' });
  });

  test('CA04 | cupom expirado exibe "Cupom expirado."', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L');
    await loja.irParaCarrinhoPeloMenu();
    await loja.aplicarCupom('VERAO2026');

    await loja.esperarMensagem('Cupom expirado.');
    await loja.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 119,90' });
  });

  test('CA06 | subtotal de R$ 200,00 já tem frete grátis', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L', 2);
    await loja.irParaCarrinhoPeloMenu();

    await loja.esperarResumo({ subtotal: 'R$ 200,00', frete: 'R$ 0,00', total: 'R$ 200,00' });
  });

  test('CA07 | subtotal de R$ 199,80 ainda paga frete de R$ 19,90', async () => {
    await loja.adicionarProduto('Camiseta Essencial');
    await loja.adicionarProduto('Calça Jeans Slim');
    await loja.irParaCarrinhoPeloMenu();

    await loja.esperarResumo({ subtotal: 'R$ 199,80', frete: 'R$ 19,90', total: 'R$ 219,70' });
  });

  test('CA08 | frete grátis considera o subtotal antes do desconto', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L', 2);
    await loja.irParaCarrinhoPeloMenu();
    await loja.aplicarCupom('BEMVINDO10');

    await loja.esperarResumo({ subtotal: 'R$ 200,00', desconto: 'R$ 20,00', frete: 'R$ 0,00', total: 'R$ 180,00' });
  });

  test('CA09 | desconto não incide sobre o frete', async () => {
    await loja.adicionarProduto('Mochila Urbana 20L');
    await loja.irParaCarrinhoPeloMenu();
    await loja.aplicarCupom('BEMVINDO10');

    await loja.esperarResumo({ desconto: 'R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' });
  });
});
