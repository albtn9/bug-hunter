import { expect, Locator, Page } from '@playwright/test';

export type CampoResumo = 'subtotal' | 'desconto' | 'frete' | 'total';

const escapar = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "Resumo do pedido": aparece no carrinho e no checkout, com valores em <dd data-valor="...">. */
export class ResumoPedido {
  constructor(private readonly page: Page) {}

  valor(campo: CampoResumo): Locator {
    return this.page.locator(`[data-valor="${campo}"]`);
  }

  /**
   * Frete grátis aparece como "Grátis" (e não "R$ 0,00").
   * O desconto aparece com sinal ("- R$ 20,00"), então só o final do texto é comparado.
   */
  async esperar(esperado: Partial<Record<CampoResumo, string>>) {
    for (const [campo, texto] of Object.entries(esperado) as [CampoResumo, string][]) {
      const alvo = this.valor(campo);
      if (campo === 'desconto') {
        await expect(alvo, 'desconto').toHaveText(new RegExp(`${escapar(texto)}$`));
      } else {
        await expect(alvo, campo).toHaveText(texto);
      }
    }
  }
}
