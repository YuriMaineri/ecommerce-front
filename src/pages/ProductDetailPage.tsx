import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/client';
import { productsService } from '../api/products.service';
import { Alert } from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">Sem imagem</text></svg>`,
  );

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  const canBuy = isAuthenticated && !isAdmin;

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    productsService
      .getById(id)
      .then((p) => active && setProduct(p))
      .catch((err) => active && setError(getApiErrorMessage(err, 'Produto nao encontrado.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function handleAdd() {
    if (!product) return;
    setAdding(true);
    setToast('');
    try {
      await addToCart(product.id, quantity);
      setToast('Adicionado ao carrinho!');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel adicionar ao carrinho.'));
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <Spinner label="Carregando produto..." />;
  if (error && !product) {
    return (
      <div className="mx-auto max-w-md">
        <Alert variant="error">{error}</Alert>
        <Link to="/" className="btn-secondary mt-4">
          Voltar ao catalogo
        </Link>
      </div>
    );
  }
  if (!product) return null;

  const image = product.image || product.thumbnail || PLACEHOLDER;
  const outOfStock = product.stock <= 0;

  return (
    <div>
      <Link to="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        &larr; Voltar ao catalogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        </div>

        <div>
          {product.category && (
            <span className="badge mb-3 bg-brand-50 text-brand-700">{product.category.name}</span>
          )}
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-3 text-slate-600">{product.description}</p>
          <p className="mt-6 text-3xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
          <p className="mt-1 text-sm text-slate-500">
            {outOfStock ? 'Produto esgotado' : `${product.stock} unidades disponiveis`}
          </p>

          {toast && (
            <div className="mt-4">
              <Alert variant="success">{toast}</Alert>
            </div>
          )}

          {canBuy ? (
            <div className="mt-6 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="input w-20"
                disabled={outOfStock}
              />
              <button className="btn-primary" onClick={handleAdd} disabled={outOfStock || adding}>
                {adding ? 'Adicionando...' : 'Adicionar ao carrinho'}
              </button>
            </div>
          ) : (
            !isAdmin && (
              <button className="btn-primary mt-6" onClick={() => navigate('/login')}>
                Entre para comprar
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
