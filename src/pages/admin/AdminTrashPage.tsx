import { useCallback, useEffect, useState } from 'react';
import { categoriesService } from '../../api/categories.service';
import { getApiErrorMessage } from '../../api/client';
import { productsService } from '../../api/products.service';
import { usersService } from '../../api/users.service';
import { Alert } from '../../components/Alert';
import { Spinner } from '../../components/Spinner';
import type { Category, Product, User } from '../../types';
import { formatCurrency } from '../../utils/format';

type Tab = 'products' | 'categories' | 'users';

export function AdminTrashPage() {
  const [tab, setTab] = useState<Tab>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, c, u] = await Promise.all([
        productsService.listDeleted(),
        categoriesService.listDeleted(),
        usersService.listDeleted(),
      ]);
      setProducts(p);
      setCategories(c);
      setUsers(u);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function restore(kind: Tab, id: string, label: string) {
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      if (kind === 'products') await productsService.restore(id);
      else if (kind === 'categories') await categoriesService.restore(id);
      else await usersService.restore(id);
      setMessage(`"${label}" foi restaurado.`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel restaurar.'));
    } finally {
      setBusyId(null);
    }
  }

  const counts = { products: products.length, categories: categories.length, users: users.length };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Lixeira</h1>
      <p className="mb-6 text-sm text-slate-500">Registros excluidos logicamente. Restaure o que precisar.</p>

      {message && (
        <div className="mb-4">
          <Alert variant="success">{message}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        <TabButton active={tab === 'products'} onClick={() => setTab('products')}>
          Produtos ({counts.products})
        </TabButton>
        <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>
          Categorias ({counts.categories})
        </TabButton>
        <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
          Usuarios ({counts.users})
        </TabButton>
      </div>

      {loading ? (
        <Spinner />
      ) : tab === 'products' ? (
        <TrashList
          items={products}
          empty="Nenhum produto na lixeira."
          render={(p) => ({
            title: p.name,
            subtitle: `${p.category?.name ?? 'Sem categoria'} - ${formatCurrency(p.price)}`,
          })}
          busyId={busyId}
          onRestore={(p) => restore('products', p.id, p.name)}
        />
      ) : tab === 'categories' ? (
        <TrashList
          items={categories}
          empty="Nenhuma categoria na lixeira."
          render={(c) => ({ title: c.name, subtitle: c.description })}
          busyId={busyId}
          onRestore={(c) => restore('categories', c.id, c.name)}
        />
      ) : (
        <TrashList
          items={users}
          empty="Nenhum usuario na lixeira."
          render={(u) => ({ title: u.name, subtitle: `${u.email} - ${u.role}` })}
          busyId={busyId}
          onRestore={(u) => restore('users', u.id, u.name)}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

interface TrashListProps<T extends { id: string }> {
  items: T[];
  empty: string;
  render: (item: T) => { title: string; subtitle: string };
  busyId: string | null;
  onRestore: (item: T) => void;
}

function TrashList<T extends { id: string }>({ items, empty, render, busyId, onRestore }: TrashListProps<T>) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-slate-500">{empty}</p>;
  }
  return (
    <div className="card divide-y divide-slate-100">
      {items.map((item) => {
        const { title, subtitle } = render(item);
        return (
          <div key={item.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-slate-800">{title}</p>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <button
              className="btn-secondary py-1.5"
              onClick={() => onRestore(item)}
              disabled={busyId === item.id}
            >
              {busyId === item.id ? 'Restaurando...' : 'Restaurar'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
