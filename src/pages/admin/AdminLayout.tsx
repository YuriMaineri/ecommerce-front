import { NavLink, Outlet } from 'react-router-dom';

export function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="card h-fit p-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Administracao</p>
        <nav className="space-y-1">
          <NavLink to="/admin/products" className={linkClass}>
            Produtos
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            Categorias
          </NavLink>
        </nav>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
