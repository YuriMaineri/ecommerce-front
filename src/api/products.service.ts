import { api } from './client';
import type {
  CreateProductPayload,
  Paginated,
  Product,
  ProductListParams,
  UpdateProductPayload,
} from '../types';

export const productsService = {
  async list(params: ProductListParams = {}): Promise<Paginated<Product>> {
    const { data } = await api.get<Paginated<Product>>('/products', { params });
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

  async listDeleted(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products/deleted');
    return data;
  },

  async restore(id: string): Promise<Product> {
    const { data } = await api.post<Product>(`/products/${id}/restore`);
    return data;
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
