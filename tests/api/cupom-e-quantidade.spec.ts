import { test, expect } from '@playwright/test';
import { CUPONS } from '../support/dados';

const calcular = (request: any, data: unknown) =>
  request.post('/api/carrinho/calcular', { data });

// Cenários: 01-cupom-desconto.feature, 03-limite-quantidade.feature, 06-api-contrato-e-erros.feature
test.describe('API | cupons (CA02, CA03, CA04)', () => {
  const itens = [{ produtoId: 'P005', quantidade: 1 }];

  for (const codigo of ['BEMVINDO10', 'bemvindo10', 'BemVindo10', '  BEMVINDO10', 'BEMVINDO10  ', ' bemvindo10 ']) {
    test(`CA02 | normaliza o código "${codigo}"`, async ({ request }) => {
      const body = await (await calcular(request, { itens, cupom: codigo })).json();
      expect(body.cupom.aplicado).toBe(true);
      expect(body.desconto).toBe(10);
    });
  }

  test('CA03 | cupom inexistente: 200, sem desconto e mensagem', async ({ request }) => {
    const resp = await calcular(request, { itens, cupom: CUPONS.INEXISTENTE });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.cupom.aplicado).toBe(false);
    expect(body.cupom.mensagem).toBe('Cupom inválido.');
    expect(body.desconto).toBe(0);
    expect(body.total).toBe(119.9);
  });

  test('CA04 | cupom expirado: 200, sem desconto e mensagem', async ({ request }) => {
    const resp = await calcular(request, { itens, cupom: CUPONS.EXPIRADO });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.cupom.aplicado).toBe(false);
    expect(body.cupom.mensagem).toBe('Cupom expirado.');
    expect(body.desconto).toBe(0);
  });

  test('em /pedidos, cupom inválido e expirado geram 422', async ({ request }) => {
    const base = { cliente: { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' }, itens };
    const inv = await request.post('/api/pedidos', { data: { ...base, cupom: CUPONS.INEXISTENTE } });
    expect(inv.status()).toBe(422);
    expect((await inv.json()).erro.codigo).toBe('CUPOM_INVALIDO');

    const exp = await request.post('/api/pedidos', { data: { ...base, cupom: CUPONS.EXPIRADO } });
    expect(exp.status()).toBe(422);
    expect((await exp.json()).erro.codigo).toBe('CUPOM_EXPIRADO');
  });
});

test.describe('API | limite de quantidade (CA10)', () => {
  test('5 unidades é aceito', async ({ request }) => {
    const resp = await calcular(request, { itens: [{ produtoId: 'P004', quantidade: 5 }] });
    expect(resp.status()).toBe(200);
    expect((await resp.json()).subtotal).toBe(249.5);
  });

  for (const quantidade of [6, 100]) {
    test(`quantidade ${quantidade} é recusada`, async ({ request }) => {
      test.info().annotations.push({ type: 'bug', description: 'BUG-002 | CA10 em /api/carrinho/calcular' });
      const resp = await calcular(request, { itens: [{ produtoId: 'P004', quantidade }] });
      expect(resp.status()).toBe(422);
      const erro = (await resp.json()).erro;
      expect(erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
      expect(erro.campo).toBe('itens[0].quantidade');
    });
  }

  for (const quantidade of [0, -1, 1.5, '2', null]) {
    test(`quantidade ${JSON.stringify(quantidade)} é inválida`, async ({ request }) => {
      const resp = await calcular(request, { itens: [{ produtoId: 'P004', quantidade }] });
      expect(resp.status()).toBe(422);
      expect((await resp.json()).erro.codigo).toBe('QUANTIDADE_INVALIDA');
    });
  }

  test('limite também vale ao confirmar o pedido', async ({ request }) => {
    test.info().annotations.push({ type: 'bug', description: 'BUG-003 | CA10 em /api/pedidos' });
    const resp = await request.post('/api/pedidos', {
      data: {
        cliente: { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' },
        itens: [{ produtoId: 'P004', quantidade: 6 }],
      },
    });
    expect(resp.status()).toBe(422);
    expect((await resp.json()).erro.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  });
});
