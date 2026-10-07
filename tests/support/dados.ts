// Dados fixos da documentação (seção "Dados para teste").

export const PRODUTOS = {
  P001: { nome: 'Camiseta Essencial', preco: 59.9 },
  P002: { nome: 'Calça Jeans Slim', preco: 139.9 },
  P003: { nome: 'Tênis Casual Urbano', preco: 189.9 },
  P004: { nome: 'Boné Aba Curva', preco: 49.9 },
  P005: { nome: 'Mochila Urbana 20L', preco: 100.0 },
  P006: { nome: 'Kit 3 Pares de Meias', preco: 29.9 },
  P007: { nome: 'Jaqueta Corta-Vento', preco: 229.9 },
  P008: { nome: 'Garrafa Térmica 750ml', preco: 50.0 },
} as const;

export type ProdutoId = keyof typeof PRODUTOS;

export const CUPONS = {
  VALIDO: 'BEMVINDO10',
  EXPIRADO: 'VERAO2026',
  INEXISTENTE: 'XPTO99',
} as const;

export interface Item {
  produtoId: string;
  quantidade: unknown;
}

export interface CasoCalculo {
  nome: string;
  itens: { produtoId: ProdutoId; quantidade: number }[];
  cupom?: string;
  subtotal: number;
  desconto: number;
  frete: number;
  faltante: number;
  total: number;
}

// Valores esperados calculados à mão (ver docs/cenarios/04-calculo-total.feature).
export const MATRIZ_CALCULO: CasoCalculo[] = [
  { nome: '#1 sem cupom, abaixo de 200', itens: [{ produtoId: 'P005', quantidade: 1 }], subtotal: 100, desconto: 0, frete: 19.9, faltante: 100, total: 119.9 },
  { nome: '#2 BEMVINDO10, abaixo de 200', itens: [{ produtoId: 'P005', quantidade: 1 }], cupom: 'BEMVINDO10', subtotal: 100, desconto: 10, frete: 19.9, faltante: 100, total: 109.9 },
  { nome: '#3 limite logo abaixo (199,80)', itens: [{ produtoId: 'P001', quantidade: 1 }, { produtoId: 'P002', quantidade: 1 }], subtotal: 199.8, desconto: 0, frete: 19.9, faltante: 0.2, total: 219.7 },
  { nome: '#4 limite exato (200,00)', itens: [{ produtoId: 'P005', quantidade: 2 }], subtotal: 200, desconto: 0, frete: 0, faltante: 0, total: 200 },
  { nome: '#5 200,00 com cupom (CA08)', itens: [{ produtoId: 'P005', quantidade: 2 }], cupom: 'BEMVINDO10', subtotal: 200, desconto: 20, frete: 0, faltante: 0, total: 180 },
  { nome: '#6 P001x3 com cupom (arredondamento)', itens: [{ produtoId: 'P001', quantidade: 3 }], cupom: 'BEMVINDO10', subtotal: 179.7, desconto: 17.97, frete: 19.9, faltante: 20.3, total: 181.63 },
  { nome: '#7 P007 com cupom', itens: [{ produtoId: 'P007', quantidade: 1 }], cupom: 'BEMVINDO10', subtotal: 229.9, desconto: 22.99, frete: 0, faltante: 0, total: 206.91 },
  { nome: '#8 exemplo da documentação', itens: [{ produtoId: 'P002', quantidade: 1 }, { produtoId: 'P004', quantidade: 2 }], cupom: 'BEMVINDO10', subtotal: 239.7, desconto: 23.97, frete: 0, faltante: 0, total: 215.73 },
  { nome: '#9 P006x5 com cupom', itens: [{ produtoId: 'P006', quantidade: 5 }], cupom: 'BEMVINDO10', subtotal: 149.5, desconto: 14.95, frete: 19.9, faltante: 50.5, total: 154.45 },
  { nome: '#10 P003 com cupom', itens: [{ produtoId: 'P003', quantidade: 1 }], cupom: 'BEMVINDO10', subtotal: 189.9, desconto: 18.99, frete: 19.9, faltante: 10.1, total: 190.81 },
];

export const CLIENTE_VALIDO = {
  nome: 'Maria Silva',
  email: 'maria@exemplo.com',
  cep: '01310-100',
};
