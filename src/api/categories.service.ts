import { api } from './client';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types';

export const categoriesService = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  async update(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  async listDeleted(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories/deleted');
    return data;
  },

  async restore(id: string): Promise<Category> {
    const { data } = await api.post<Category>(`/categories/${id}/restore`);
    return data;
  },
};
