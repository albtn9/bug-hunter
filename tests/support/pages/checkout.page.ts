import { expect, Locator, Page } from '@playwright/test';
import { ResumoPedido } from './resumo.component';

export interface DadosCliente {
  nome: string;
  email: string;
  cep: string;
}

/** Página /checkout: dados de entrega (o pagamento é feito na entrega). */
export class CheckoutPage {
  readonly resumo: ResumoPedido;

  constructor(private readonly page: Page) {
    this.resumo = new ResumoPedido(page);
  }

  get campoNome(): Locator {
    return this.page.getByLabel('Nome completo', { exact: true });
  }

  get campoEmail(): Locator {
    return this.page.getByLabel('E-mail', { exact: true });
  }

  get campoCep(): Locator {
    return this.page.getByLabel('CEP', { exact: true });
  }

  get botaoConfirmar(): Locator {
    return this.page.getByRole('button', { name: 'Confirmar pedido' });
  }

  get infoPagamento(): Locator {
    return this.page.getByText('O pagamento é feito na entrega.');
  }

  async abrir() {
    await this.page.goto('/checkout');
  }

  async preencher(dados: Partial<DadosCliente>) {
    if (dados.nome !== undefined) await this.campoNome.fill(dados.nome);
    if (dados.email !== undefined) await this.campoEmail.fill(dados.email);
    if (dados.cep !== undefined) await this.campoCep.fill(dados.cep);
  }

  async confirmar() {
    await this.botaoConfirmar.click();
  }

  /** Campo inválido: aria-invalid="true" e, opcionalmente, a mensagem ligada por aria-describedby. */
  async esperarInvalido(campo: Locator, mensagem?: string | RegExp) {
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    if (mensagem) await expect(campo).toHaveAccessibleDescription(mensagem);
  }

  async esperarValido(campo: Locator) {
    await expect(campo).not.toHaveAttribute('aria-invalid', 'true');
  }

  async esperarPermanecerNoCheckout() {
    await expect(this.page).toHaveURL(/\/checkout$/);
  }
}
