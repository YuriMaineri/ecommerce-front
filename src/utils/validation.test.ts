import { describe, expect, it } from 'vitest';
import {
  hasErrors,
  isValidEmail,
  validateLogin,
  validateProduct,
  validateRegister,
} from './validation';

describe('isValidEmail', () => {
  it('aceita e-mails validos', () => {
    expect(isValidEmail('teste@email.com')).toBe(true);
  });
  it('rejeita e-mails invalidos', () => {
    expect(isValidEmail('teste')).toBe(false);
    expect(isValidEmail('teste@')).toBe(false);
    expect(isValidEmail('teste@email')).toBe(false);
  });
});

describe('validateLogin', () => {
  it('exige e-mail e senha validos', () => {
    const errors = validateLogin({ email: '', password: '123' });
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
    expect(hasErrors(errors)).toBe(true);
  });

  it('passa com credenciais validas', () => {
    const errors = validateLogin({ email: 'a@b.com', password: '12345678' });
    expect(hasErrors(errors)).toBe(false);
  });
});

describe('validateRegister', () => {
  it('detecta senhas que nao conferem', () => {
    const errors = validateRegister({
      name: 'Joao',
      email: 'joao@email.com',
      password: '12345678',
      confirmPassword: '87654321',
    });
    expect(errors.confirmPassword).toBeTruthy();
  });
});

describe('validateProduct', () => {
  it('exige preco maior que zero e categoria', () => {
    const errors = validateProduct({
      name: 'X',
      description: '',
      price: 0,
      stock: -1,
      categoryId: '',
    });
    expect(errors.name).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(errors.price).toBeTruthy();
    expect(errors.stock).toBeTruthy();
    expect(errors.categoryId).toBeTruthy();
  });

  it('passa com dados validos', () => {
    const errors = validateProduct({
      name: 'Camiseta',
      description: 'Algodao',
      price: 49.9,
      stock: 10,
      categoryId: 'cat1',
    });
    expect(hasErrors(errors)).toBe(false);
  });
});
