import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import { Alert } from '../components/Alert';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { hasErrors, validateLogin, type FieldErrors } from '../utils/validation';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    const validation = validateLogin({ email, password });
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Falha ao entrar. Verifique suas credenciais.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mb-6 text-sm text-slate-500">Acesse sua conta para comprar e acompanhar pedidos.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <TextField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="voce@email.com"
          />
          <TextField
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="********"
          />
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Nao tem conta?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
