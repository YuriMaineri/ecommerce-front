import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ordersService } from '../api/orders.service';
import type { Order } from '../types';
import { useAuth } from '../hooks/useAuth';
import { CartContext, type CartContextValue } from './cart-context';

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const isCustomer = user?.role === 'CUSTOMER';

  /** Busca o pedido em aberto (CREATED) do usuario, se houver. */
  const refresh = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const orders = await ordersService.list();
      const open = orders.find((o) => o.status === 'CREATED') ?? null;
      setCart(open);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Garante que existe um pedido em aberto e retorna seu id. */
  const ensureCart = useCallback(async (): Promise<Order> => {
    if (cart) return cart;
    const created = await ordersService.create();
    setCart(created);
    return created;
  }, [cart]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      const current = await ensureCart();
      const updated = await ordersService.addItem(current.id, productId, quantity);
      setCart(updated);
    },
    [ensureCart],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart) return;
      const updated = await ordersService.updateItem(cart.id, itemId, quantity);
      setCart(updated);
    },
    [cart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!cart) return;
      const updated = await ordersService.removeItem(cart.id, itemId);
      setCart(updated);
    },
    [cart],
  );

  const beginCheckout = useCallback(async () => {
    if (!cart) throw new Error('Carrinho vazio.');
    const result = await ordersService.checkout(cart.id);
    // O pedido saiu de CREATED (foi para AWAITING_PAYMENT); limpa o carrinho ativo.
    setCart(null);
    return result;
  }, [cart]);

  const cancelCart = useCallback(async () => {
    if (!cart) return;
    await ordersService.updateStatus(cart.id, 'CANCELLED');
    setCart(null);
  }, [cart]);

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo<CartContextValue>(
    () => ({ cart, loading, itemCount, addToCart, updateItem, removeItem, beginCheckout, cancelCart, refresh }),
    [cart, loading, itemCount, addToCart, updateItem, removeItem, beginCheckout, cancelCart, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
