import type { OrderStatus } from '../types';

/** Formata um valor numerico como moeda brasileira (R$). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(value) ? value : 0);
}

/** Formata uma data ISO para o padrao dd/mm/aaaa. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED: 'Em aberto',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluido',
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  CREATED: 'bg-amber-100 text-amber-800',
  PAID: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
};
