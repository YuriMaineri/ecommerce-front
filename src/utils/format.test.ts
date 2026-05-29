import { describe, expect, it } from 'vitest';
import { ORDER_STATUS_LABEL, formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('formata valores em reais', () => {
    expect(formatCurrency(10)).toContain('10,00');
    expect(formatCurrency(1234.5)).toContain('1.234,50');
  });

  it('trata valores invalidos como zero', () => {
    expect(formatCurrency(Number.NaN)).toContain('0,00');
  });
});

describe('formatDate', () => {
  it('formata uma data ISO valida', () => {
    expect(formatDate('2026-05-28T12:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('retorna "-" para data invalida', () => {
    expect(formatDate('nao-e-data')).toBe('-');
  });
});

describe('ORDER_STATUS_LABEL', () => {
  it('traduz os status do pedido', () => {
    expect(ORDER_STATUS_LABEL.CREATED).toBe('Em aberto');
    expect(ORDER_STATUS_LABEL.PAID).toBe('Pago');
    expect(ORDER_STATUS_LABEL.CANCELLED).toBe('Cancelado');
    expect(ORDER_STATUS_LABEL.COMPLETED).toBe('Concluido');
  });
});
