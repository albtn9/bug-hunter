import type { Page } from '@playwright/test';
import type { ProdutoId } from './dados';

/** Chaves que a loja guarda no sessionStorage da aba (vistas em DevTools > Application). */
export const CHAVES = {
  itens: 'verzel-store:itens',
  cupom: 'verzel-store:cupom',
  ultimoPedido: 'verzel-store:ultimo-pedido',
} as const;

export interface ItemSemente {
  produtoId: ProdutoId;
  quantidade: number;
}

/**
 * Monta o carrinho direto no sessionStorage (formato: [{ produtoId, quantidade }]).
 * Evita clicar produto por produto nos testes que não são sobre "adicionar ao carrinho".
 * Depois disso, abra a página desejada (ex.: page.goto('/carrinho')).
 */
export async function gravarItensNoCarrinho(page: Page, itens: ItemSemente[]) {
  await page.goto('/');
  await page.evaluate(
    ([chave, valor]) => sessionStorage.setItem(chave, valor),
    [CHAVES.itens, JSON.stringify(itens)] as [string, string],
  );
}

/** Lê o último pedido confirmado, que a loja guarda para exibir a tela de confirmação. */
export async function lerUltimoPedido(page: Page): Promise<{ numero: string; total: number } | null> {
  return page.evaluate((chave) => {
    const bruto = sessionStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  }, CHAVES.ultimoPedido);
}
