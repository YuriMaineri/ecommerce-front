import { api } from './client';
import type { UpdateUserPayload, User } from '../types';

export const usersService = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async listDeleted(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users/deleted');
    return data;
  },

  async restore(id: string): Promise<User> {
    const { data } = await api.post<User>(`/users/${id}/restore`);
    return data;
  },
};
