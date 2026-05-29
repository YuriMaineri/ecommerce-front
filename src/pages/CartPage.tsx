import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import { productsService } from '../api/products.service';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/format';

export function CartPage() {
  const { cart, loading, updateItem, removeItem, checkout } = useCart();
  const navigate = useNavigate();

  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // Carrega os nomes dos produtos presentes no carrinho (o pedido so traz productId).
  useEffect(() => {
    if (!cart) return;
    const missing = cart.items.map((i) => i.productId).filter((pid) => !names[pid]);
    if (missing.length === 0) return;
    Promise.all(missing.map((pid) => productsService.getById(pid).catch(() => null))).then((results) => {
      setNames((prev) => {
        const next = { ...prev };
        results.forEach((p) => {
          if (p) next[p.id] = p.name;
        });
        return next;
      });
    });
  }, [cart, names]);

  async function handleQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyItem(itemId);
    setError('');
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyItem(null);
    }
  }

  async function handleRemove(itemId: string) {
    setBusyItem(itemId);
    setError('');
    try {
      await removeItem(itemId);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyItem(null);
    }
  }

  async function handleCheckout() {
    setCheckingOut(true);
    setError('');
    try {
      await checkout();
      navigate('/orders');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel finalizar o pedido.'));
      setCheckingOut(false);
    }
  }

  if (loading) return <Spinner label="Carregando carrinho..." />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Seu carrinho esta vazio</h1>
        <p className="mt-2 text-slate-500">Adicione produtos do catalogo para comecar.</p>
        <Link to="/" className="btn-primary mt-6">
          Ver catalogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Carrinho</h1>
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {cart.items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{names[item.productId] ?? 'Produto'}</p>
                <p className="text-sm text-slate-500">{formatCurrency(item.unitPrice)} cada</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="btn-secondary h-8 w-8 p-0"
                  onClick={() => handleQuantity(item.id, item.quantity - 1)}
                  disabled={busyItem === item.id || item.quantity <= 1}
                  aria-label="Diminuir"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  className="btn-secondary h-8 w-8 p-0"
                  onClick={() => handleQuantity(item.id, item.quantity + 1)}
                  disabled={busyItem === item.id}
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>

              <div className="w-24 text-right font-semibold text-slate-900">{formatCurrency(item.subtotal)}</div>

              <button
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
                onClick={() => handleRemove(item.id)}
                disabled={busyItem === item.id}
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumo</h2>
          <div className="flex items-center justify-between text-slate-600">
            <span>Itens</span>
            <span>{cart.items.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(cart.totalAmount)}</span>
          </div>
          <button className="btn-primary mt-6 w-full" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? 'Finalizando...' : 'Finalizar pedido'}
          </button>
          <Link to="/" className="btn-secondary mt-2 w-full">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
