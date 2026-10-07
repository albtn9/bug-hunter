import { expect, Page } from '@playwright/test';

/**
 * Page Object da Verzel Store.
 *
 * ATENÇÃO: os seletores abaixo foram escritos SEM inspecionar a interface real
 * (só a documentação foi analisada). Ajuste os pontos marcados com "AJUSTAR"
 * usando `npx playwright codegen <URL da loja>` e deixe todos os seletores AQUI,
 * para os testes não precisarem mudar.
 */
export class LojaPage {
  constructor(private readonly page: Page) {}

  /** Remove espaços (inclusive NBSP) para comparar "R$ 109,90" de forma estável. */
  static normaliza(texto: string | null): string {
    return (texto ?? '').replace(/\s/g, '');
  }

  async abrirProdutos() {
    await this.page.goto('/');
  }

  async abrirCarrinho() {
    await this.page.goto('/carrinho');
  }

  // Carrinho fica só na aba (sessionStorage), então navegar via link mantém o estado;
  // evitar page.goto('/carrinho') depois de adicionar itens se o carrinho zerar.
  async irParaCarrinhoPeloMenu() {
    await this.page.getByRole('link', { name: /carrinho/i }).click();
  }

  /** AJUSTAR: card do produto + botão de adicionar. */
  async adicionarProduto(nome: string, vezes = 1) {
    const card = this.page.locator('article, li, div').filter({ hasText: nome }).filter({
      has: this.page.getByRole('button', { name: /adicionar/i }),
    }).last();
    for (let i = 0; i < vezes; i++) {
      await card.getByRole('button', { name: /adicionar/i }).click();
    }
  }

  /** AJUSTAR: campo e botão do cupom. */
  async aplicarCupom(codigo: string) {
    await this.page.getByLabel(/cupom/i).fill(codigo);
    await this.page.getByRole('button', { name: /aplicar/i }).click();
  }

  /** AJUSTAR: linha do resumo (rótulo + valor ao lado). */
  private valorDoResumo(rotulo: RegExp | string) {
    return this.page
      .getByText(rotulo, { exact: typeof rotulo === 'string' })
      .first()
      .locator('xpath=following-sibling::*[1]');
  }

  async esperarResumo(esperado: { subtotal?: string; desconto?: string; frete?: string; total?: string }) {
    const rotulos: Record<string, RegExp> = {
      subtotal: /^subtotal$/i,
      desconto: /^desconto$/i,
      frete: /^frete$/i,
      total: /^total$/i,
    };
    for (const [campo, valor] of Object.entries(esperado)) {
      const alvo = this.valorDoResumo(rotulos[campo]);
      await expect
        .poll(async () => LojaPage.normaliza(await alvo.textContent()), { message: campo })
        .toContain(LojaPage.normaliza(valor));
    }
  }

  async esperarMensagem(texto: string) {
    await expect(this.page.getByText(texto)).toBeVisible();
  }
}
