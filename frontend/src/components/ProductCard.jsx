import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const fmt = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i === Math.floor(rating) && rating % 1 >= 0.5;
        return (
          <svg
            key={i}
            className={`w-3 h-3 ${filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

const DISCOUNT_MAP = [0, 20, 0, 15, 0, 30, 0, 10, 0, 25];

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const rating = parseFloat((3.5 + (product.id % 5) * 0.3).toFixed(1));
  const reviewCount = 20 + ((product.id * 17) % 180);
  const discountPct = DISCOUNT_MAP[(product.id - 1) % DISCOUNT_MAP.length] || 0;
  const originalPrice = discountPct > 0 ? Math.round(product.price / (1 - discountPct / 100)) : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/' } } }); return; }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event('cartUpdated'));
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {}
    setAdding(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((w) => !w);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
      data-testid="product-card"
    >
      {/* Discount badge */}
      {discountPct > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          -{discountPct}%
        </div>
      )}

      {/* New badge (for products 1-3) */}
      {product.id <= 3 && discountPct === 0 && (
        <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          NEW
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        aria-label="Wishlist"
      >
        <svg
          className={`w-4 h-4 transition-colors ${wishlist ? 'text-red-500 fill-current' : 'text-gray-400'}`}
          fill={wishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Image */}
      <Link to={`/products/${product.id}`} className="block overflow-hidden bg-gray-50" tabIndex={-1}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url || 'https://via.placeholder.com/400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize w-fit">
          {product.category}
        </span>

        <Link to={`/products/${product.id}`}>
          <h3
            className="mt-2 font-semibold text-gray-800 line-clamp-2 text-sm leading-snug hover:text-blue-600 transition min-h-[2.5rem]"
            data-testid="product-name"
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating row */}
        <div className="flex items-center gap-1.5 mt-2">
          <StarRating rating={rating} />
          <span className="text-xs text-amber-500 font-semibold">{rating}</span>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-blue-600" data-testid="product-price">
              {fmt(product.price)}
            </p>
            {originalPrice && (
              <p className="text-xs text-gray-400 line-through">{fmt(originalPrice)}</p>
            )}
          </div>
          <p className={`text-xs font-medium mt-0.5 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
          </p>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          data-testid="quick-add-to-cart"
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            added
              ? 'bg-emerald-500 text-white scale-95'
              : product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-blue-200 hover:shadow-md'
          }`}
        >
          {adding ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding…
            </span>
          ) : added ? (
            '✓ Added to Cart!'
          ) : product.stock === 0 ? (
            'Out of Stock'
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}
