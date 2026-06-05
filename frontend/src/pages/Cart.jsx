import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const fmt = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

const PROMOS = { SHOPEASE10: 10, SAVE20: 20 };

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const navigate = useNavigate();

  const fetchCart = () => {
    api.get('/cart')
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/${id}`, { quantity });
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch {}
  };

  const remove = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      fetchCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch {}
  };

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    const discount = PROMOS[code];
    if (discount) {
      setAppliedPromo({ code, discount });
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try SHOPEASE10 or SAVE20.');
      setAppliedPromo(null);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.Product?.price) || 0) * i.quantity, 0);
  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.discount / 100) : 0;
  const total = subtotal - discount;
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-8 bg-gray-200 rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
            {items.length > 0 && (
              <p className="text-gray-500 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
            )}
          </div>
          <Link to="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm" data-testid="empty-cart">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-7 text-sm">Looks like you haven't added anything yet. Let's fix that!</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3" data-testid="cart-items">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-start hover:shadow-md transition"
                  data-testid="cart-item"
                >
                  <Link to={`/products/${item.Product?.id}`} className="shrink-0">
                    <img
                      src={item.Product?.image_url || 'https://via.placeholder.com/100'}
                      alt={item.Product?.name}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-100 hover:opacity-90 transition"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.Product?.id}`}>
                      <h3 className="font-semibold text-gray-800 line-clamp-1 hover:text-blue-600 transition text-sm">{item.Product?.name}</h3>
                    </Link>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{item.Product?.category}</p>
                    <p className="text-blue-600 font-bold mt-1 text-sm">{fmt(item.Product?.price)}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          data-testid="qty-decrease"
                          className="px-3 py-1.5 hover:bg-gray-200 transition text-gray-600 font-bold"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 font-bold text-gray-800 min-w-[2rem] text-center text-sm" data-testid="item-quantity">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          data-testid="qty-increase"
                          className="px-3 py-1.5 hover:bg-gray-200 transition text-gray-600 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.id)}
                        data-testid="remove-item"
                        className="text-xs text-red-400 hover:text-red-600 transition flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-gray-900 text-sm">
                      {fmt((parseFloat(item.Product?.price) || 0) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Promo code */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Promo Code</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code..."
                    data-testid="promo-input"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white transition uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                  />
                  <button
                    onClick={applyPromo}
                    data-testid="apply-promo"
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                {appliedPromo && (
                  <div className="flex items-center justify-between mt-2 bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-semibold text-green-700">{appliedPromo.code} — {appliedPromo.discount}% off</span>
                    <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="text-green-600 hover:text-green-800 text-xs">✕ Remove</button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Try: SHOPEASE10 or SAVE20</p>
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20" data-testid="cart-summary">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="font-medium">{fmt(subtotal)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromo.discount}%)</span>
                      <span className="font-medium">-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-medium">
                      {subtotal >= 500000 ? 'Free' : fmt(15000)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-900">Total</span>
                      <span className="font-extrabold text-xl text-blue-600" data-testid="cart-total">
                        {fmt(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estimated delivery */}
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Estimated delivery
                  </p>
                  <p className="text-xs text-blue-800 font-semibold mt-0.5 ml-5.5">{estimatedDelivery}</p>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  data-testid="checkout-button"
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200 text-sm"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
