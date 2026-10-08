import { marcarBug } from '../support/anotacoes';
import { expect, test } from '../support/fixtures';

// Cenários: docs/cenarios/01-cupom-desconto.feature e 02-frete-gratis.feature (@ui)
// P001 Camiseta R$ 59,90 | P002 Calça R$ 139,90 | P005 Mochila R$ 100,00

test.describe('UI | cupom de desconto', () => {
  test('CA01 | BEMVINDO10 desconta 10% do subtotal', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.aplicarCupom('BEMVINDO10');

    await carrinho.esperarCupomAplicado('BEMVINDO10');
    await carrinho.esperarResumo({ subtotal: 'R$ 100,00', desconto: 'R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' });
  });

  test('CA01 | desconto sobre subtotal com frete grátis (R$ 539,50)', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([
      { produtoId: 'P001', quantidade: 2 },
      { produtoId: 'P002', quantidade: 3 },
    ]);
    await carrinho.aplicarCupom('BEMVINDO10');

    await carrinho.esperarResumo({ subtotal: 'R$ 539,50', desconto: 'R$ 53,95', frete: 'Grátis', total: 'R$ 485,55' });
  });

  for (const codigo of ['bemvindo10', 'BemVindo10', '  BEMVINDO10', 'BEMVINDO10  ', ' bemvindo10 ']) {
    test(`CA02 | código "${codigo}" é normalizado`, async ({ carrinhoCom, carrinho }) => {
      await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
      await carrinho.aplicarCupom(codigo);

      await carrinho.esperarCupomAplicado('BEMVINDO10');
      await carrinho.esperarResumo({ desconto: 'R$ 10,00' });
    });
  }

  test('CA03 | cupom inexistente exibe "Cupom inválido."', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.aplicarCupom('XPTO99');

    await carrinho.esperarErroCupom('Cupom inválido.');
    await carrinho.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 119,90' });
  });

  test('CA04 | cupom expirado exibe "Cupom expirado."', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.aplicarCupom('VERAO2026');

    await carrinho.esperarErroCupom('Cupom expirado.');
    await carrinho.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 119,90' });
  });

  test('CA05 | com cupom aplicado o campo some; para trocar é preciso remover', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.aplicarCupom('BEMVINDO10');
    await carrinho.esperarCupomAplicado('BEMVINDO10');

    await expect(carrinho.campoCupom).toHaveCount(0);

    await carrinho.botaoRemoverCupom.click();
    await expect(carrinho.campoCupom).toBeVisible();
    await carrinho.esperarResumo({ desconto: 'R$ 0,00', total: 'R$ 119,90' });

    await carrinho.aplicarCupom('VERAO2026');
    await carrinho.esperarErroCupom('Cupom expirado.');
  });
});

test.describe('UI | frete grátis', () => {
  test('CA06 | subtotal de R$ 200,00 já tem frete grátis', async ({ carrinhoCom, carrinho }) => {
    marcarBug('BUG-001', 'CA06');
    await carrinhoCom([{ produtoId: 'P005', quantidade: 2 }]);

    await carrinho.esperarResumo({ subtotal: 'R$ 200,00', frete: 'Grátis', total: 'R$ 200,00' });
  });

  test('CA07 | subtotal de R$ 199,80 paga frete de R$ 19,90 e informa o que falta', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([
      { produtoId: 'P001', quantidade: 1 },
      { produtoId: 'P002', quantidade: 1 },
    ]);

    await carrinho.esperarResumo({ subtotal: 'R$ 199,80', frete: 'R$ 19,90', total: 'R$ 219,70' });
    await expect(carrinho.avisoFaltante('R$ 0,20')).toBeVisible();
  });

  test('CA08 | frete grátis considera o subtotal antes do desconto', async ({ carrinhoCom, carrinho }) => {
    marcarBug('BUG-001', 'CA08');
    await carrinhoCom([{ produtoId: 'P005', quantidade: 2 }]);
    await carrinho.aplicarCupom('BEMVINDO10');

    await carrinho.esperarCupomAplicado('BEMVINDO10');
    await carrinho.esperarResumo({ subtotal: 'R$ 200,00', desconto: 'R$ 20,00', frete: 'Grátis', total: 'R$ 180,00' });
  });

  test('CA09 | desconto do cupom não incide sobre o frete', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.aplicarCupom('BEMVINDO10');

    await carrinho.esperarCupomAplicado('BEMVINDO10');
    await carrinho.esperarResumo({ desconto: 'R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' });
  });
});
