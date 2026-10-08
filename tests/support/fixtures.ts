import { test as base, expect } from '@playwright/test';
import { gravarItensNoCarrinho, ItemSemente } from './armazenamento';
import { CarrinhoPage } from './pages/carrinho.page';
import { CheckoutPage } from './pages/checkout.page';
import { ConfirmacaoPage } from './pages/confirmacao.page';
import { VitrinePage } from './pages/vitrine.page';

export interface ItemCarrinho {
  nome: string;
  quantidade: number;
}

interface Fixtures {
  vitrine: VitrinePage;
  carrinho: CarrinhoPage;
  checkout: CheckoutPage;
  confirmacao: ConfirmacaoPage;
  /** "Dado que adicionei ... ao carrinho" pela interface (vitrine) e abre o carrinho. Mais lento; use na jornada. */
  montarCarrinho: (itens: ItemCarrinho[]) => Promise<void>;
  /** Monta o carrinho direto no sessionStorage e abre /carrinho. Rápido; use nos demais testes. */
  carrinhoCom: (itens: ItemSemente[]) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  vitrine: async ({ page }, use) => {
    await use(new VitrinePage(page));
  },
  carrinho: async ({ page }, use) => {
    await use(new CarrinhoPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  confirmacao: async ({ page }, use) => {
    await use(new ConfirmacaoPage(page));
  },
  montarCarrinho: async ({ vitrine, carrinho }, use) => {
    await use(async (itens) => {
      await vitrine.abrir();
      for (const { nome, quantidade } of itens) {
        await vitrine.adicionar(nome, quantidade);
      }
      await vitrine.irParaCarrinho();
      await carrinho.esperarCalculo();
    });
  },
  carrinhoCom: async ({ page, carrinho }, use) => {
    await use(async (itens) => {
      await gravarItensNoCarrinho(page, itens);
      await page.goto('/carrinho');
      await carrinho.esperarCalculo();
    });
  },
});

export { expect };
