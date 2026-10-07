import { test, expect } from '@playwright/test';

// Reprodução isolada do BUG-001: limite do frete grátis (CA06, "a partir de R$ 200,00, inclusive").
// Cenário: docs/cenarios/02-frete-gratis.feature
const casos = [
  { nome: 'P005 × 2 = 200,00', itens: [{ produtoId: 'P005', quantidade: 2 }], subtotal: 200, gratis: true, bug: true },
  { nome: 'P008 × 4 = 200,00', itens: [{ produtoId: 'P008', quantidade: 4 }], subtotal: 200, gratis: true, bug: true },
  // Controles: lados do limite que devem passar.
  { nome: 'P001 + P002 = 199,80 (abaixo)', itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P002', quantidade: 1 }], subtotal: 199.8, gratis: false, bug: false },
  { nome: 'P003 + P006 = 219,80 (acima)', itens: [{ produtoId: 'P003', quantidade: 1 }, { produtoId: 'P006', quantidade: 1 }], subtotal: 219.8, gratis: true, bug: false },
];

test.describe('API | limite do frete grátis (R$ 200,00)', () => {
  for (const c of casos) {
    test(c.nome, async ({ request }, testInfo) => {
      if (c.bug) testInfo.annotations.push({ type: 'bug', description: 'BUG-001 | CA06' });

      const resp = await request.post('/api/carrinho/calcular', { data: { itens: c.itens } });
      expect(resp.status()).toBe(200);
      const body = await resp.json();
      await testInfo.attach('resposta.json', {
        body: JSON.stringify(body, null, 2),
        contentType: 'application/json',
      });

      expect(body.subtotal).toBe(c.subtotal);
      expect(body.freteGratis).toBe(c.gratis);
      expect(body.frete).toBe(c.gratis ? 0 : 19.9);
    });
  }
});
