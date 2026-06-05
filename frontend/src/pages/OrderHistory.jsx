import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Payment', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  paid:      { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  shipped:   { label: 'Shipped', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
  delivered: { label: 'Delivered', color: 'bg-teal-100 text-teal-700 border-teal-200', dot: 'bg-teal-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
};

const fmt = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 flex gap-4">
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => <div key={j} className="w-14 h-14 bg-gray-200 rounded-lg" />)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} total order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Status filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => {
              const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
              if (count === 0 && s !== 'all') return null;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                    filter === s
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {s === 'all' ? 'All' : (STATUS_CONFIG[s]?.label || s)}
                  <span className={`ml-1.5 text-xs font-bold ${filter === s ? 'text-blue-200' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm" data-testid="empty-orders">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-7 text-sm">Your order history will appear here</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-testid="orders-list">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
              const thumbs = order.OrderItems?.slice(0, 3) || [];
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  data-testid="order-card"
                  className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900">Order #{order.id}</p>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`} data-testid="order-status">
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{fmtDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-blue-600" data-testid="order-total">
                          {fmt(order.total_amount)}
                        </p>
                        <p className="text-xs text-gray-400">{order.OrderItems?.length || 0} item{order.OrderItems?.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Product thumbs */}
                    {thumbs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                          {thumbs.map((item, i) => (
                            <div key={i} className="relative">
                              <img
                                src={item.Product?.image_url || 'https://via.placeholder.com/56'}
                                alt={item.product_name}
                                className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100"
                              />
                              {item.quantity > 1 && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                          {(order.OrderItems?.length || 0) > 3 && (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-500">+{order.OrderItems.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-auto text-xs text-gray-400 group-hover:text-blue-600 transition flex items-center gap-1">
                          View details
                          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
