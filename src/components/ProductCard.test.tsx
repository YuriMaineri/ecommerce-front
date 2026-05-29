import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

const baseProduct: Product = {
  id: 'p1',
  name: 'Camiseta',
  description: 'Camiseta de algodao',
  image: '',
  thumbnail: '',
  stock: 5,
  price: 49.9,
  active: true,
  createdAt: '2026-05-28T00:00:00.000Z',
  categoryId: 'c1',
  category: { id: 'c1', name: 'Roupas', description: 'Vestuario' },
};

function renderCard(props: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ProductCard product={baseProduct} {...props} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('exibe nome, categoria e preco', () => {
    renderCard();
    expect(screen.getByText('Camiseta')).toBeInTheDocument();
    expect(screen.getByText('Roupas')).toBeInTheDocument();
    expect(screen.getByText(/49,90/)).toBeInTheDocument();
  });

  it('mostra botao de compra quando canBuy e chama onAddToCart', async () => {
    const onAddToCart = vi.fn();
    renderCard({ canBuy: true, onAddToCart });
    const button = screen.getByRole('button', { name: /adicionar ao carrinho/i });
    await userEvent.click(button);
    expect(onAddToCart).toHaveBeenCalledWith(baseProduct);
  });

  it('marca como esgotado quando sem estoque', () => {
    renderCard({ product: { ...baseProduct, stock: 0 } });
    expect(screen.getByText(/esgotado/i)).toBeInTheDocument();
  });

  it('nao exibe botao de compra quando canBuy e falso', () => {
    renderCard({ canBuy: false });
    expect(screen.queryByRole('button', { name: /adicionar ao carrinho/i })).not.toBeInTheDocument();
  });
});
