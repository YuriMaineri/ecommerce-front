import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">E</span>
          MiniShop
        </Link>

        <div className="flex items-center gap-5">
          <NavLink to="/" className={linkClass} end>
            Catalogo
          </NavLink>

          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders" className={linkClass}>
              Meus pedidos
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}

          {isAuthenticated && !isAdmin && (
            <Link to="/cart" className="relative text-slate-600 hover:text-slate-900" aria-label="Carrinho">
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">Ola, {user?.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-secondary py-1.5">
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary py-1.5">
                Entrar
              </Link>
              <Link to="/register" className="btn-primary py-1.5">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}
