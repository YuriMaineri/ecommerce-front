import { createContext } from 'react';
import type { Order } from '../types';

export interface CartContextValue {
  cart: Order | null;
  loading: boolean;
  itemCount: number;
  /** Adiciona/incrementa um produto no carrinho (cria o pedido se necessario). */
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Finaliza o pedido (CREATED -> PAID). */
  checkout: () => Promise<void>;
  /** Cancela o carrinho atual. */
  cancelCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);
