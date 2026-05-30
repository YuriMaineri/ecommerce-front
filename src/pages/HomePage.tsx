import { useEffect, useState } from 'react';
import { categoriesService } from '../api/categories.service';
import { getApiErrorMessage } from '../api/client';
import { productsService } from '../api/products.service';
import { Alert } from '../components/Alert';
import { Pagination } from '../components/Pagination';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import type { Category, Product, ProductListParams } from '../types';

const PAGE_SIZE = 8;

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'name';

const SORT_MAP: Record<SortOption, Pick<ProductListParams, 'sortBy' | 'order'>> = {
  recent: { sortBy: 'createdAt', order: 'desc' },
  'price-asc': { sortBy: 'price', order: 'asc' },
  'price-desc': { sortBy: 'price', order: 'desc' },
  name: { sortBy: 'name', order: 'asc' },
};

export function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const canBuy = isAuthenticated && !isAdmin;

  // Carrega categorias uma vez.
  useEffect(() => {
    categoriesService
      .list()
      .then(setCategories)
      .catch((err) => setError(getApiErrorMessage(err)));
  }, []);

  // Debounce da busca: espera o usuario parar de digitar.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Busca produtos sempre que filtros/pagina mudam.
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params: ProductListParams = {
      active: true,
      page,
      pageSize: PAGE_SIZE,
      ...SORT_MAP[sort],
    };
    if (search.trim()) params.search = search.trim();
    if (selectedCategory !== 'all') params.categoryId = selectedCategory;

    productsService
      .list(params)
      .then((res) => {
        if (!active) return;
        setProducts(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setError('');
      })
      .catch((err) => active && setError(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [search, selectedCategory, sort, page]);

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

  function changeCategory(id: string) {
    setSelectedCategory(id);
    setPage(1);
  }

  function changeSort(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-10 text-white">
        <h1 className="text-3xl font-bold">Bem-vindo a MiniShop</h1>
        <p className="mt-2 max-w-xl text-brand-100">
          Explore nosso catalogo de produtos.{' '}
          {canBuy ? 'Adicione itens ao carrinho e finalize seu pedido.' : 'Faca login para comprar.'}
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

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          className="input lg:max-w-xs"
          placeholder="Buscar produto..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input w-auto"
            value={selectedCategory}
            onChange={(e) => changeCategory(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="input w-auto"
            value={sort}
            onChange={(e) => changeSort(e.target.value as SortOption)}
          >
            <option value="recent">Mais recentes</option>
            <option value="price-asc">Menor preco</option>
            <option value="price-desc">Maior preco</option>
            <option value="name">Nome (A-Z)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner label="Carregando produtos..." />
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-slate-500">Nenhum produto encontrado.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canBuy={canBuy}
                adding={addingId === product.id}
                onAddToCart={handleAdd}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
        </>
      )}
    </div>
  );
}
