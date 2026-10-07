import { test, expect } from '@playwright/test';
import { CUPONS, MATRIZ_CALCULO } from '../support/dados';

// Cenários: docs/cenarios/04-calculo-total.feature
test.describe('API | POST /api/carrinho/calcular | matriz de cálculo', () => {
  for (const c of MATRIZ_CALCULO) {
    test(`${c.nome}`, async ({ request }) => {
      const resp = await request.post('/api/carrinho/calcular', {
        data: { itens: c.itens, ...(c.cupom ? { cupom: c.cupom } : {}) },
      });
      expect(resp.status()).toBe(200);
      const body = await resp.json();

      expect(body.subtotal).toBe(c.subtotal);
      expect(body.desconto).toBe(c.desconto);
      expect(body.frete).toBe(c.frete);
      expect(body.freteGratis).toBe(c.frete === 0);
      expect(body.valorFaltanteFreteGratis).toBe(c.faltante);
      expect(body.total).toBe(c.total);
    });
  }

  test('CA11 | valores monetários têm no máximo 2 casas decimais', async ({ request }) => {
    const resp = await request.post('/api/carrinho/calcular', {
      data: { itens: [{ produtoId: 'P001', quantidade: 3 }], cupom: CUPONS.VALIDO },
    });
    const body = await resp.json();
    for (const campo of ['subtotal', 'desconto', 'frete', 'valorFaltanteFreteGratis', 'total']) {
      const valor: number = body[campo];
      expect(Math.round(valor * 100) / 100, `campo ${campo}`).toBe(valor);
    }
  });

  test('cálculo é repetível (API sem estado)', async ({ request }) => {
    const data = { itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: CUPONS.VALIDO };
    const a = await (await request.post('/api/carrinho/calcular', { data })).json();
    const b = await (await request.post('/api/carrinho/calcular', { data })).json();
    expect(b).toEqual(a);
  });
});
