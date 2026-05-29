import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Pagina nao encontrada</h1>
      <p className="mt-2 text-slate-500">A pagina que voce procura nao existe.</p>
      <Link to="/" className="btn-primary mt-6">
        Voltar ao inicio
      </Link>
    </div>
  );
}
