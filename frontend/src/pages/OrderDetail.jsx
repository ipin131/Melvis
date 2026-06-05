import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

const fmt = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

const fmtDate = (d) =>
  new Date(d).toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been received' },
  { key: 'paid', label: 'Payment Confirmed', icon: '💳', desc: 'Payment verified successfully' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', desc: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: '📦', desc: 'Order delivered successfully' },
];

const STATUS_ORDER = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: -1 };

function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
        <p className="text-3xl mb-2">❌</p>
        <p className="font-bold text-red-700">Order Cancelled</p>
        <p className="text-sm text-red-500 mt-1">This order has been cancelled</p>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[status] ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-6">Order Tracking</h2>
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1 first:items-start last:items-end">
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all ${
                  done
                    ? active
                      ? 'bg-blue-600 shadow-lg shadow-blue-300 scale-110'
                      : 'bg-blue-600'
                    : 'bg-white border-2 border-gray-200'
                }`}>
                  {done ? (
                    active ? (
                      <span>{step.icon}</span>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )
                  ) : (
                    <span className="text-gray-300 text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <div className="mt-2.5 text-center hidden sm:block">
                  <p className={`text-xs font-semibold ${done ? 'text-blue-700' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {active && <p className="text-[10px] text-gray-400 mt-0.5 max-w-[80px]">{step.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile labels */}
        <div className="sm:hidden mt-4 text-center">
          <p className="font-semibold text-blue-700">{STATUS_STEPS[currentStep]?.label}</p>
          <p className="text-xs text-gray-400">{STATUS_STEPS[currentStep]?.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('status');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Order not found</p>
        <Link to="/orders" className="text-blue-600 hover:underline text-sm">← Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment banners */}
        {paymentStatus === 'success' && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-6 font-medium" data-testid="success-banner">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Payment Successful!</p>
              <p className="text-sm text-emerald-600">Thank you for your order. We're processing it now.</p>
            </div>
          </div>
        )}
        {paymentStatus === 'pending' && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl mb-6 font-medium" data-testid="pending-banner">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold">Awaiting Payment</p>
              <p className="text-sm text-amber-600">Your order is waiting for payment confirmation.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6" data-testid="order-detail">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/orders" className="text-gray-400 hover:text-blue-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.id}</h1>
            </div>
            <p className="text-sm text-gray-500">{fmtDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Tracker */}
        <div className="mb-5">
          <OrderTracker status={order.status} />
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="divide-y divide-gray-50">
            {order.OrderItems?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0" data-testid="order-item">
                <img
                  src={item.Product?.image_url || 'https://via.placeholder.com/56'}
                  alt={item.product_name}
                  className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.quantity} × {fmt(item.price)}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-sm shrink-0">
                  {fmt(parseFloat(item.price) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-xl font-extrabold text-blue-600" data-testid="order-total">
                {fmt(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        {order.delivery_address && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">Delivery Location</h2>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{order.delivery_address}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-center font-semibold hover:bg-gray-50 transition text-sm"
          >
            All Orders
          </Link>
          <Link
            to="/"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-center font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200 text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
