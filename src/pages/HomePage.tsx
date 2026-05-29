import { useEffect, useMemo, useState } from 'react';
import { categoriesService } from '../api/categories.service';
import { getApiErrorMessage } from '../api/client';
import { productsService } from '../api/products.service';
import { Alert } from '../components/Alert';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import type { Category, Product } from '../types';

export function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const canBuy = isAuthenticated && !isAdmin;

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([productsService.list(), categoriesService.list()])
      .then(([prods, cats]) => {
        if (!active) return;
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => active && setError(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products
      .filter((p) => p.active)
      .filter((p) => (selectedCategory === 'all' ? true : p.categoryId === selectedCategory))
      .filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [products, selectedCategory, search]);

  async function handleAdd(product: Product) {
    setAddingId(product.id);
    setToast('');
    try {
      await addToCart(product.id, 1);
      setToast(`"${product.name}" adicionado ao carrinho.`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel adicionar ao carrinho.'));
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold">Bem-vindo a MiniShop</h1>
        <p className="mt-2 max-w-xl text-brand-100">
          Explore nosso catalogo de produtos. {canBuy ? 'Adicione itens ao carrinho e finalize seu pedido.' : 'Faca login para comprar.'}
        </p>
      </section>

      {toast && (
        <div className="mb-4">
          <Alert variant="success">{toast}</Alert>
        </div>
      )}
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>
            Todas
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={selectedCategory === c.id} onClick={() => setSelectedCategory(c.id)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Carregando produtos..." />
      ) : visibleProducts.length === 0 ? (
        <p className="py-16 text-center text-slate-500">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canBuy={canBuy}
              adding={addingId === product.id}
              onAddToCart={handleAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
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
      className={`badge border px-3 py-1 transition-colors ${
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
