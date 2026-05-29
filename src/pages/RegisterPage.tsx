import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import { Alert } from '../components/Alert';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { hasErrors, validateRegister, type FieldErrors } from '../utils/validation';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    const validation = validateRegister(form);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Nao foi possivel criar a conta.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Criar conta</h1>
        <p className="mb-6 text-sm text-slate-500">Cadastre-se para comecar a comprar.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <TextField
            label="Nome"
            name="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            placeholder="Seu nome"
          />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            placeholder="voce@email.com"
          />
          <TextField
            label="Senha"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            placeholder="Min. 8 caracteres"
          />
          <TextField
            label="Confirmar senha"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            placeholder="Repita a senha"
          />
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Ja tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
