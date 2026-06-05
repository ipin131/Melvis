import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const fmt = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-amber-500">{rating}</span>
      <span className="text-sm text-gray-400">({count} reviews)</span>
    </div>
  );
}

const TRUST_BADGES = [
  { icon: '🚚', title: 'Free Delivery', desc: 'Orders over Rp 500k' },
  { icon: '↩️', title: '30-Day Returns', desc: 'Easy return process' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Encrypted checkout' },
  { icon: '✅', title: '1-Year Warranty', desc: 'Covered by ShopEase' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);

  const rating = id ? parseFloat((3.5 + (parseInt(id) % 5) * 0.3).toFixed(1)) : 4.2;
  const reviewCount = id ? 20 + ((parseInt(id) * 17) % 180) : 50;

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity });
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(`${quantity} item${quantity > 1 ? 's' : ''} added to cart!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity });
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/checkout');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed. Please try again.', 'error');
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <Link to={`/?category=${product.category}`} className="hover:text-blue-600 capitalize transition">
            {product.category}
          </Link>
          <span>›</span>
          <span className="text-gray-700 font-medium line-clamp-1 max-w-xs">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative bg-gray-50 p-8 flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden">
                <img
                  src={product.image_url || 'https://via.placeholder.com/600?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute top-5 left-5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full capitalize">
                {product.category}
              </span>
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col" data-testid="product-detail">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight" data-testid="product-detail-name">
                {product.name}
              </h1>

              <div className="mt-3">
                <StarRating rating={rating} count={reviewCount} />
              </div>

              <div className="mt-4 pb-4 border-b border-gray-100">
                <p className="text-4xl font-extrabold text-blue-600" data-testid="product-detail-price">
                  {fmt(product.price)}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${
                      product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-500' : 'text-red-500'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-400' : 'bg-red-500'}`} />
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
                  </span>
                  {product.stock > 0 && (
                    <span className="text-xs text-gray-400">({product.stock} units available)</span>
                  )}
                </div>
              </div>

              <div className="py-4 border-b border-gray-100">
                <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center gap-4 py-5 border-b border-gray-100">
                  <label className="text-sm font-semibold text-gray-700">Qty</label>
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-2.5 text-gray-600 hover:bg-gray-200 transition font-bold text-lg"
                      data-testid="qty-decrease"
                    >
                      −
                    </button>
                    <span className="px-5 py-2.5 font-bold text-gray-800 min-w-[3rem] text-center" data-testid="qty-value">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-4 py-2.5 text-gray-600 hover:bg-gray-200 transition font-bold text-lg"
                      data-testid="qty-increase"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    Subtotal: <span className="font-semibold text-gray-700">{fmt(product.price * quantity)}</span>
                  </span>
                </div>
              )}

              {toast && (
                <div
                  className={`my-3 flex items-center gap-2 p-3.5 rounded-xl text-sm font-medium ${
                    toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                  }`}
                  data-testid="toast"
                >
                  {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  data-testid="add-to-cart-button"
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3.5 px-6 rounded-2xl font-bold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                >
                  {adding ? 'Adding…' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={adding || product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-200 text-sm"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {TRUST_BADGES.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{b.title}</p>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to products
        </button>
      </div>
    </div>
  );
}
