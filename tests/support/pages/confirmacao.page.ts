import { expect, Locator, Page } from '@playwright/test';
import { ResumoPedido } from './resumo.component';

/**
 * Página /pedido-confirmado 
 * selo "Pedido confirmado", <h1>Pedido <span class="numero-pedido">VZ-000000</span></h1>,
 * resumo com data-valor e lista de itens ("2x Camiseta Essencial").
 */
export class ConfirmacaoPage {
  readonly resumo: ResumoPedido;

  constructor(private readonly page: Page) {
    this.resumo = new ResumoPedido(page);
  }

  get selo(): Locator {
    return this.page.getByText('Pedido confirmado', { exact: true });
  }

  get titulo(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get contadorCarrinho(): Locator {
    return this.page.locator('.contador-carrinho');
  }

  item(quantidade: number, nome: string): Locator {
    return this.page.getByText(`${quantidade}x ${nome}`, { exact: true });
  }

  /** Confirma a tela e devolve o número do pedido (VZ-000000). */
  async esperarPedidoConfirmado(): Promise<string> {
    await expect(this.page).toHaveURL(/\/pedido-confirmado/);
    await expect(this.selo).toBeVisible();
    await expect(this.titulo).toHaveText(/Pedido\s+VZ-\d{6}/);
    const texto = await this.titulo.innerText();
    return texto.match(/VZ-\d{6}/)![0];
  }
}
