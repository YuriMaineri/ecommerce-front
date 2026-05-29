import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  canBuy?: boolean;
  adding?: boolean;
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">Sem imagem</text></svg>`,
  );

export function ProductCard({ product, onAddToCart, canBuy = false, adding = false }: ProductCardProps) {
  const image = product.thumbnail || product.image || PLACEHOLDER;
  const outOfStock = product.stock <= 0;

  return (
    <div className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="badge mb-2 w-fit bg-brand-50 text-brand-700">{product.category.name}</span>
        )}
        <Link to={`/products/${product.id}`} className="font-semibold text-slate-900 hover:text-brand-600">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
          {outOfStock ? (
            <span className="badge bg-red-100 text-red-700">Esgotado</span>
          ) : (
            <span className="text-xs text-slate-400">{product.stock} em estoque</span>
          )}
        </div>

        {canBuy && onAddToCart && (
          <button
            className="btn-primary mt-3 w-full"
            disabled={outOfStock || adding}
            onClick={() => onAddToCart(product)}
          >
            {adding ? 'Adicionando...' : 'Adicionar ao carrinho'}
          </button>
        )}
      </div>
    </div>
  );
}
