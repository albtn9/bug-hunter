import { expect, Locator, Page } from '@playwright/test';

/** Página inicial (/): vitrine de produtos. */
export class VitrinePage {
  constructor(private readonly page: Page) {}

  /** Contador do carrinho no cabeçalho (ex.: aria-label "5 itens no carrinho"). */
  get contadorCarrinho(): Locator {
    return this.page.locator('.contador-carrinho');
  }

  async abrir() {
    await this.page.goto('/');
  }

  /** Cada produto é um <article> nomeado pelo próprio título (aria-labelledby). */
  produto(nome: string): Locator {
    return this.page.getByRole('article', { name: nome, exact: true });
  }

  botaoAdicionar(nome: string): Locator {
    return this.produto(nome).getByRole('button', { name: 'Adicionar ao carrinho' });
  }

  /** Mensagem exibida abaixo do produto (região aria-live). */
  aviso(nome: string): Locator {
    return this.produto(nome).locator('.produto-aviso');
  }

  /** Adiciona e confirma que o contador do cabeçalho subiu (evita corrida com a navegação). */
  async adicionar(nome: string, vezes = 1) {
    const antes = Number(await this.contadorCarrinho.innerText());
    for (let i = 0; i < vezes; i++) {
      await this.botaoAdicionar(nome).click();
    }
    await expect(this.contadorCarrinho).toHaveText(String(antes + vezes));
  }

  async irParaCarrinho() {
    await this.page
      .getByRole('navigation', { name: 'Principal' })
      .getByRole('link', { name: /Carrinho/ })
      .click();
  }
}
