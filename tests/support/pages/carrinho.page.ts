import { expect, Locator, Page } from '@playwright/test';
import { CampoResumo, ResumoPedido } from './resumo.component';

/** Página /carrinho: itens, cupom e resumo do pedido. */
export class CarrinhoPage {
  readonly resumo: ResumoPedido;

  constructor(private readonly page: Page) {
    this.resumo = new ResumoPedido(page);
  }

  // ---- Itens (os nomes vêm dos aria-label da própria UI) ----
  linha(nome: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('heading', { name: nome, exact: true }) });
  }

  quantidade(nome: string): Locator {
    return this.page.getByRole('group', { name: `Quantidade de ${nome}`, exact: true }).locator('output');
  }

  botaoAumentar(nome: string): Locator {
    return this.page.getByRole('button', { name: `Aumentar quantidade de ${nome}`, exact: true });
  }

  botaoDiminuir(nome: string): Locator {
    return this.page.getByRole('button', { name: `Diminuir quantidade de ${nome}`, exact: true });
  }

  botaoRemover(nome: string): Locator {
    return this.page.getByRole('button', { name: `Remover ${nome} do carrinho`, exact: true });
  }

  avisoLimite(nome: string): Locator {
    return this.linha(nome).getByText('Limite de 5 unidades por produto.');
  }

  get botaoEsvaziar(): Locator {
    return this.page.getByRole('button', { name: 'Esvaziar carrinho' });
  }

  get tituloVazio(): Locator {
    return this.page.getByRole('heading', { name: 'Seu carrinho está vazio' });
  }

  get linkFinalizar(): Locator {
    return this.page.getByRole('link', { name: 'Finalizar compra' });
  }

  // ---- Cupom ----
  // Sem cupom aplicado: campo + botão "Aplicar cupom".
  // Com cupom aplicado: o campo some e aparece "Cupom X aplicado." + botão "Remover cupom".
  get campoCupom(): Locator {
    return this.page.getByLabel('Cupom de desconto');
  }

  get botaoAplicarCupom(): Locator {
    return this.page.getByRole('button', { name: 'Aplicar cupom' });
  }

  get botaoRemoverCupom(): Locator {
    return this.page.getByRole('button', { name: 'Remover cupom', exact: true });
  }

  get cupomAplicado(): Locator {
    return this.page.locator('.cupom-aplicado');
  }

  async aplicarCupom(codigo: string) {
    await this.campoCupom.fill(codigo);
    await this.botaoAplicarCupom.click();
  }

  async esperarCupomAplicado(codigo: string) {
    await expect(this.cupomAplicado).toContainText(`Cupom ${codigo} aplicado.`);
  }

  /** Erro de cupom: <p role="alert"> e campo com aria-invalid="true". */
  async esperarErroCupom(texto: string) {
    await expect(this.page.getByRole('alert')).toHaveText(texto);
    await expect(this.campoCupom).toHaveAttribute('aria-invalid', 'true');
  }

  // ---- Resumo ----
  valor(campo: CampoResumo): Locator {
    return this.resumo.valor(campo);
  }

  /** Falta de frete grátis: "Faltam R$ 0,20 para o frete grátis." */
  avisoFaltante(valor: string): Locator {
    return this.page.getByText(`Faltam ${valor} para o frete grátis.`);
  }

  /** O resumo é recalculado pela API; a coluna fica com aria-busy="true" enquanto espera. */
  async esperarCalculo() {
    await expect(this.page.locator('.coluna-resumo')).toHaveAttribute('aria-busy', 'false');
  }

  async esperarResumo(esperado: Partial<Record<CampoResumo, string>>) {
    await this.esperarCalculo();
    await this.resumo.esperar(esperado);
  }
}
