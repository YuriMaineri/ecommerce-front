import { api } from './client';
import type { Order, OrderStatus } from '../types';

export const ordersService = {
  async list(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  /** Cria um pedido vazio (carrinho). CUSTOMER. */
  async create(): Promise<Order> {
    const { data } = await api.post<Order>('/orders');
    return data;
  },

  async addItem(orderId: string, productId: string, quantity: number): Promise<Order> {
    const { data } = await api.post<Order>(`/orders/${orderId}/items`, { productId, quantity });
    return data;
  },

  async updateItem(orderId: string, itemId: string, quantity: number): Promise<Order> {
    const { data } = await api.put<Order>(`/orders/${orderId}/items/${itemId}`, { quantity });
    return data;
  },

  async removeItem(orderId: string, itemId: string): Promise<Order> {
    const { data } = await api.delete<Order>(`/orders/${orderId}/items/${itemId}`);
    return data;
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
