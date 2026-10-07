import { test, expect } from '@playwright/test';
import { PRODUTOS } from '../support/dados';

// Cenário: 06-api-contrato-e-erros.feature
test.describe('API | produtos e erros', () => {
  test('GET /api/produtos lista os 8 produtos com contrato e preços da doc', async ({ request }) => {
    const resp = await request.get('/api/produtos');
    expect(resp.status()).toBe(200);
    const lista = await resp.json();
    expect(lista).toHaveLength(8);
    for (const p of lista) {
      expect(p).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          nome: expect.any(String),
          descricao: expect.any(String),
          categoria: expect.any(String),
          preco: expect.any(Number),
        }),
      );
      const esperado = PRODUTOS[p.id as keyof typeof PRODUTOS];
      expect(esperado, `produto ${p.id} existe na doc`).toBeDefined();
      expect(p.nome).toBe(esperado.nome);
      expect(p.preco).toBe(esperado.preco);
    }
  });

  test('GET /api/produtos/P001 retorna 200', async ({ request }) => {
    const resp = await request.get('/api/produtos/P001');
    expect(resp.status()).toBe(200);
    expect((await resp.json()).id).toBe('P001');
  });

  test('produto inexistente: 404 PRODUTO_NAO_ENCONTRADO no formato padrão', async ({ request }) => {
    const resp = await request.get('/api/produtos/P999');
    expect(resp.status()).toBe(404);
    const erro = (await resp.json()).erro;
    expect(erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
    expect(erro.mensagem).toEqual(expect.any(String));
  });

  test('rota inexistente: 404 ROTA_NAO_ENCONTRADA', async ({ request }) => {
    const resp = await request.get('/api/xyz');
    expect(resp.status()).toBe(404);
    expect((await resp.json()).erro.codigo).toBe('ROTA_NAO_ENCONTRADA');
  });

  for (const [metodo, rota] of [
    ['GET', '/api/carrinho/calcular'],
    ['GET', '/api/pedidos'],
    ['POST', '/api/produtos'],
  ] as const) {
    test(`${metodo} ${rota}: 405 METODO_NAO_PERMITIDO`, async ({ request }) => {
      const resp = await request.fetch(rota, { method: metodo });
      expect(resp.status()).toBe(405);
      expect((await resp.json()).erro.codigo).toBe('METODO_NAO_PERMITIDO');
    });
  }

  test('JSON malformado: 400 JSON_INVALIDO', async ({ request }) => {
    const resp = await request.post('/api/carrinho/calcular', {
      headers: { 'Content-Type': 'application/json' },
      data: '{itens: ',
    });
    expect(resp.status()).toBe(400);
    expect((await resp.json()).erro.codigo).toBe('JSON_INVALIDO');
  });

  for (const [corpo, codigo] of [
    [{}, 'ITENS_OBRIGATORIOS'],
    [{ itens: [] }, 'ITENS_OBRIGATORIOS'],
    [{ itens: ['P001'] }, 'ITEM_INVALIDO'],
    [{ itens: [{ produtoId: 'P999', quantidade: 1 }] }, 'PRODUTO_NAO_ENCONTRADO'],
    [{ itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P001', quantidade: 1 }] }, 'ITEM_DUPLICADO'],
  ] as const) {
    test(`422 ${codigo} para ${JSON.stringify(corpo)}`, async ({ request }) => {
      const resp = await request.post('/api/carrinho/calcular', { data: corpo });
      expect(resp.status()).toBe(422);
      expect((await resp.json()).erro.codigo).toBe(codigo);
    });
  }
});

test.describe('API | POST /api/pedidos', () => {
  const cliente = { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' };
  const itens = [{ produtoId: 'P005', quantidade: 1 }];

  test('pedido válido: 201, número VZ-000000 e resumo igual ao cálculo', async ({ request }) => {
    const calculo = await (
      await request.post('/api/carrinho/calcular', { data: { itens, cupom: 'BEMVINDO10' } })
    ).json();
    const resp = await request.post('/api/pedidos', { data: { cliente, itens, cupom: 'BEMVINDO10' } });
    expect(resp.status()).toBe(201);
    const pedido = await resp.json();
    expect(pedido.numero).toMatch(/^VZ-\d{6}$/);
    for (const campo of ['subtotal', 'desconto', 'frete', 'freteGratis', 'valorFaltanteFreteGratis', 'total']) {
      expect(pedido[campo], campo).toEqual(calculo[campo]);
    }
  });

  for (const [cep, ok] of [
    ['01310-100', true],
    ['01310100', true],
    ['0131010', false],
    ['013101000', false],
    ['01310-1000', false],
    ['abcdefgh', false],
  ] as const) {
    test(`CEP "${cep}" ${ok ? 'é aceito' : 'é recusado'}`, async ({ request }) => {
      const resp = await request.post('/api/pedidos', { data: { cliente: { ...cliente, cep }, itens } });
      expect(resp.status()).toBe(ok ? 201 : 422);
      if (!ok) expect((await resp.json()).erro.codigo).toBe('DADOS_INVALIDOS');
    });
  }

  for (const [campo, valor] of [
    ['nome', 'Maria'],
    ['email', 'maria'],
    ['email', 'maria@'],
  ] as const) {
    test(`${campo} "${valor}" é recusado`, async ({ request }) => {
      const resp = await request.post('/api/pedidos', {
        data: { cliente: { ...cliente, [campo]: valor }, itens },
      });
      expect(resp.status()).toBe(422);
      expect((await resp.json()).erro.codigo).toBe('DADOS_INVALIDOS');
    });
  }
});
