import { PRODUTOS } from '../support/dados';
import { expect, test } from '../support/fixtures';

// Cenários exploratórios: docs/cenarios/01-cupom-desconto.feature (alterar quantidade, remover itens)
const mochila = PRODUTOS.P005.nome;

test.describe('UI | manutenção do carrinho', () => {
  test('aumentar a quantidade recalcula o subtotal', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.botaoAumentar(mochila).click();

    await expect(carrinho.quantidade(mochila)).toHaveText('2');
    await carrinho.esperarResumo({ subtotal: 'R$ 200,00' });
  });

  test('diminuir a quantidade recalcula o subtotal', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 2 }]);
    await carrinho.botaoDiminuir(mochila).click();

    await expect(carrinho.quantidade(mochila)).toHaveText('1');
    await carrinho.esperarResumo({ subtotal: 'R$ 100,00' });
  });

  test('aumentar a quantidade com cupom aplicado recalcula o desconto', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.aplicarCupom('BEMVINDO10');
    await carrinho.esperarCupomAplicado('BEMVINDO10');

    await carrinho.botaoAumentar(mochila).click();

    await expect(carrinho.quantidade(mochila)).toHaveText('2');
    await carrinho.esperarResumo({ subtotal: 'R$ 200,00', desconto: 'R$ 20,00' });
  });

  test('remover o único item deixa o carrinho vazio', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await carrinho.botaoRemover(mochila).click();

    await expect(carrinho.tituloVazio).toBeVisible();
  });

  test('esvaziar carrinho remove todos os itens', async ({ carrinhoCom, carrinho }) => {
    await carrinhoCom([
      { produtoId: 'P005', quantidade: 1 },
      { produtoId: 'P001', quantidade: 2 },
    ]);
    await carrinho.botaoEsvaziar.click();

    await expect(carrinho.tituloVazio).toBeVisible();
  });
});
