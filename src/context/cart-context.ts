import { createContext } from 'react';
import type { CheckoutResponse, Order } from '../types';

export interface CartContextValue {
  cart: Order | null;
  loading: boolean;
  itemCount: number;
  /** Adiciona/incrementa um produto no carrinho (cria o pedido se necessario). */
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Envia o pedido para pagamento (CREATED -> AWAITING_PAYMENT) e retorna a referencia. */
  beginCheckout: () => Promise<CheckoutResponse>;
  /** Cancela o carrinho atual. */
  cancelCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);
