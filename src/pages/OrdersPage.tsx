import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import { ordersService } from '../api/orders.service';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { useCart } from '../hooks/useCart';
import type { Order } from '../types';
import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, formatCurrency, formatDate } from '../utils/format';

export function OrdersPage() {
  const { refresh: refreshCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersService.list();
      setOrders(data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCancel(order: Order) {
    setBusyId(order.id);
    setError('');
    try {
      await ordersService.updateStatus(order.id, 'CANCELLED');
      await load();
      await refreshCart();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel cancelar o pedido.'));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner label="Carregando pedidos..." />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Meus pedidos</h1>
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <p>Voce ainda nao tem pedidos.</p>
          <Link to="/" className="btn-primary mt-4">
            Ver catalogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-slate-400">#{order.id.slice(-8)}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`badge ${ORDER_STATUS_STYLE[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-2 text-sm">
                    <span className="text-slate-600">
                      {item.quantity}x &middot; {formatCurrency(item.unitPrice)}
                    </span>
                    <span className="font-medium text-slate-800">{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                {order.status === 'CREATED' && (
                  <button
                    className="btn-danger py-1.5"
                    onClick={() => handleCancel(order)}
                    disabled={busyId === order.id}
                  >
                    {busyId === order.id ? 'Cancelando...' : 'Cancelar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
