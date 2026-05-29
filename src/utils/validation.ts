// Validacoes simples alinhadas com as regras do backend (class-validator).

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export interface FieldErrors {
  [field: string]: string | undefined;
}

export function validateLogin(values: { email: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(values.email)) errors.email = 'E-mail invalido.';
  if (!values.password) errors.password = 'Informe a senha.';
  else if (!isMinLength(values.password, 8)) errors.password = 'A senha deve ter ao menos 8 caracteres.';
  return errors;
}

export function validateRegister(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!isMinLength(values.name, 2)) errors.name = 'Informe o nome (min. 2 caracteres).';
  if (!values.email.trim()) errors.email = 'Informe o e-mail.';
  else if (!isValidEmail(values.email)) errors.email = 'E-mail invalido.';
  if (!isMinLength(values.password, 8)) errors.password = 'A senha deve ter ao menos 8 caracteres.';
  if (values.password !== values.confirmPassword) errors.confirmPassword = 'As senhas nao conferem.';
  return errors;
}

export function validateProduct(values: {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!isMinLength(values.name, 2)) errors.name = 'Nome deve ter ao menos 2 caracteres.';
  if (!isMinLength(values.description, 1)) errors.description = 'Descricao obrigatoria.';
  if (!(values.price >= 0.01)) errors.price = 'Preco deve ser maior que zero.';
  if (!(values.stock >= 0) || !Number.isInteger(values.stock)) errors.stock = 'Estoque invalido.';
  if (!values.categoryId) errors.categoryId = 'Selecione uma categoria.';
  return errors;
}

export function validateCategory(values: { name: string; description: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!isMinLength(values.name, 2)) errors.name = 'Nome deve ter ao menos 2 caracteres.';
  if (!isMinLength(values.description, 1)) errors.description = 'Descricao obrigatoria.';
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
