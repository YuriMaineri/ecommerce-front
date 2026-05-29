import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/client';
import { productsService } from '../../api/products.service';
import { Alert } from '../../components/Alert';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/format';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await productsService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setError('');
    try {
      await productsService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel excluir o produto.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + Novo produto
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-slate-500">Nenhum produto cadastrado.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Preco</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                <th className="px-4 py-3 text-center">Ativo</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    {p.active ? (
                      <span className="badge bg-green-100 text-green-700">Sim</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-500">Nao</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p.id}`} className="text-brand-600 hover:underline">
                        Editar
                      </Link>
                      <button onClick={() => setToDelete(p)} className="text-red-600 hover:underline">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(toDelete)} title="Excluir produto" onClose={() => setToDelete(null)}>
        <p className="text-sm text-slate-600">
          Tem certeza que deseja excluir <strong>{toDelete?.name}</strong>? Esta acao nao pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setToDelete(null)} disabled={deleting}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
