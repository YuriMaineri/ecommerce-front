import { api } from './client';
import type { CreateProductPayload, Product, UpdateProductPayload } from '../types';

export const productsService = {
  async list(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

  async listByCategory(categoryId: string): Promise<Product[]> {
    const { data } = await api.get<Product[]>(`/products/category/${categoryId}`);
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async uploadImage(id: string, file: File): Promise<Product> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<Product>(`/products/${id}/image`, form);
    return data;
  },

  async uploadThumbnail(id: string, file: File): Promise<Product> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<Product>(`/products/${id}/thumbnail`, form);
    return data;
  },
};
