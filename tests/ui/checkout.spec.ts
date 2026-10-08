import { CLIENTE_VALIDO } from '../support/dados';
import { lerUltimoPedido } from '../support/armazenamento';
import { expect, test } from '../support/fixtures';

// Cenários: docs/cenarios/05-dados-do-cliente.feature (@ui)

test.describe('UI | jornada de compra', () => {
  test('da vitrine à confirmação do pedido com cupom', async ({
    page, montarCarrinho, carrinho, checkout, confirmacao,
  }) => {
    await montarCarrinho([{ nome: 'Mochila Urbana 20L', quantidade: 1 }]);
    await carrinho.aplicarCupom('BEMVINDO10');
    await carrinho.esperarCupomAplicado('BEMVINDO10');

    await carrinho.linkFinalizar.click();
    await checkout.resumo.esperar({ subtotal: 'R$ 100,00', desconto: 'R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' });

    await checkout.preencher(CLIENTE_VALIDO);
    await checkout.confirmar();

    const numero = await confirmacao.esperarPedidoConfirmado();
    expect((await lerUltimoPedido(page))?.numero).toBe(numero);

    await confirmacao.resumo.esperar({ subtotal: 'R$ 100,00', desconto: 'R$ 10,00', frete: 'R$ 19,90', total: 'R$ 109,90' });
    await expect(confirmacao.item(1, 'Mochila Urbana 20L')).toBeVisible();
    await expect(confirmacao.contadorCarrinho).toHaveText('0');
  });
});

test.describe('UI | checkout', () => {
  test.beforeEach(async ({ carrinhoCom, checkout }) => {
    await carrinhoCom([{ produtoId: 'P005', quantidade: 1 }]);
    await checkout.abrir();
  });

  test('não há etapa de pagamento online: o pagamento é na entrega', async ({ checkout }) => {
    await expect(checkout.infoPagamento).toBeVisible();
    await expect(checkout.campoNome).toBeVisible();
    await expect(checkout.campoEmail).toBeVisible();
    await expect(checkout.campoCep).toBeVisible();
  });

  test('formulário vazio exibe as mensagens de erro', async ({ checkout }) => {
    await checkout.confirmar();

    await checkout.esperarInvalido(checkout.campoNome, /Informe o nome completo\./);
    await checkout.esperarInvalido(checkout.campoEmail, /Informe o e-mail\./);
    await checkout.esperarPermanecerNoCheckout();
  });

  for (const cep of ['01310-100', '01310100']) {
    test(`CEP "${cep}" é aceito`, async ({ checkout, confirmacao }) => {
      await checkout.preencher({ ...CLIENTE_VALIDO, cep });
      await checkout.confirmar();

      await confirmacao.esperarPedidoConfirmado();
    });
  }

  test('CEP "11111-1111" (9 dígitos) é recusado com a mensagem de 8 dígitos', async ({ checkout }) => {
    await checkout.preencher({ ...CLIENTE_VALIDO, cep: '11111-1111' });
    await checkout.confirmar();

    await checkout.esperarInvalido(checkout.campoCep, /Informe um CEP com 8 dígitos\./);
    await checkout.esperarPermanecerNoCheckout();
  });

  for (const cep of ['0131010', '013101000', '01310-1000', 'abcdefgh']) {
    test(`CEP "${cep}" é recusado`, async ({ checkout }) => {
      await checkout.preencher({ ...CLIENTE_VALIDO, cep });
      await checkout.confirmar();

      await checkout.esperarInvalido(checkout.campoCep);
      await checkout.esperarPermanecerNoCheckout();
    });
  }

  test('nome sem sobrenome é recusado', async ({ checkout }) => {
    await checkout.preencher({ ...CLIENTE_VALIDO, nome: 'Maria' });
    await checkout.confirmar();

    await checkout.esperarInvalido(checkout.campoNome);
    await checkout.esperarPermanecerNoCheckout();
  });

  for (const email of ['maria', 'maria@', '@exemplo.com']) {
    test(`e-mail "${email}" é recusado`, async ({ checkout }) => {
      await checkout.preencher({ ...CLIENTE_VALIDO, email });
      await checkout.confirmar();

      await checkout.esperarInvalido(checkout.campoEmail);
      await checkout.esperarPermanecerNoCheckout();
    });
  }
});
