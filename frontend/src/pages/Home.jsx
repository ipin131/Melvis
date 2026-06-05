import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['all', 'electronics', 'fashion', 'food', 'sports', 'beauty', 'home'];

const CATEGORY_CARDS = [
  {
    key: 'electronics',
    label: 'Electronics',
    desc: 'Phones, TVs, Audio & more',
    gradient: 'from-blue-500 to-indigo-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'fashion',
    label: 'Fashion',
    desc: 'Shoes, Clothes & Bags',
    gradient: 'from-pink-500 to-rose-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11a4 4 0 01-8 0m8 0V7a4 4 0 00-8 0v4m8 0H8m0 0H5l-1 9h16l-1-9h-3" />
      </svg>
    ),
  },
  {
    key: 'food',
    label: 'Food & Drinks',
    desc: 'Kopi, Cokelat & Snack',
    gradient: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    key: 'sports',
    label: 'Sports',
    desc: 'Gym, Lari & Outdoor',
    gradient: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'beauty',
    label: 'Beauty',
    desc: 'Skincare & Kosmetik',
    gradient: 'from-purple-500 to-fuchsia-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    key: 'home',
    label: 'Home Living',
    desc: 'Perabot & Peralatan Rumah',
    gradient: 'from-cyan-500 to-sky-600',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

const TRUST = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over Rp 500k' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Midtrans & bank transfer' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
  { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [loading, setLoading] = useState(true);
  const isFiltered = search !== '' || category !== 'all';

  useEffect(() => {
    // Sync state with URL on first load
    const urlSearch = searchParams.get('search') || '';
    const urlCat = searchParams.get('category') || 'all';
    if (urlSearch !== search) setSearch(urlSearch);
    if (urlCat !== category) setCategory(urlCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== 'all') params.category = category;
    api.get('/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    const newParams = {};
    if (search) newParams.search = search;
    if (category !== 'all') newParams.category = category;
    setSearchParams(newParams, { replace: true });
  }, [search, category]);

  const handleCategoryCard = (key) => {
    if (key === 'sale') {
      setSearch('');
      setCategory('all');
    } else {
      setSearch('');
      setCategory(key);
    }
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Hero */}
      {!isFiltered && (
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-900/30 rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
            <div className="max-w-2xl">
              <span className="inline-block bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-widest shadow-lg">
                Summer Collection 2024
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5">
                Shop Smarter,<br />
                <span className="text-blue-200">Live Better</span>
              </h1>
              <p className="text-blue-100 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                Discover thousands of products across electronics, fashion, and premium food.
                Fast delivery, guaranteed quality, and unbeatable prices.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg text-sm"
                >
                  Shop Now
                </button>
                <Link
                  to="/stores"
                  className="border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition text-sm"
                >
                  Find Stores
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/20">
                {[
                  { value: '10+', label: 'Products' },
                  { value: '50K+', label: 'Customers' },
                  { value: '10', label: 'Store Locations' },
                  { value: '4.8★', label: 'Avg. Rating' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust badges */}
        {!isFiltered && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
            {TRUST.map((t) => (
              <div
                key={t.title}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category cards */}
        {!isFiltered && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {CATEGORY_CARDS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleCategoryCard(c.key)}
                  className={`group relative bg-gradient-to-br ${c.gradient} rounded-2xl p-6 text-left overflow-hidden hover:scale-105 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="relative">
                    <div className="mb-3">{c.icon}</div>
                    <p className="font-bold text-white text-base">{c.label}</p>
                    <p className="text-white/70 text-xs mt-1">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Products section */}
        <section id="products-section" className={isFiltered ? 'pt-6' : ''}>
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isFiltered
                  ? `${category !== 'all' ? category.charAt(0).toUpperCase() + category.slice(1) : 'All'} Products${search ? ` matching "${search}"` : ''}`
                  : 'All Products'}
              </h2>
              {products.length > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
              )}
            </div>
            {isFiltered && (
              <button
                onClick={() => { setSearch(''); setCategory('all'); }}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-7 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="search-input"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  data-testid={`category-${cat}`}
                  className={`px-4 py-2.5 rounded-xl font-medium capitalize text-sm transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-testid="loading">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-9 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">No products found</p>
              <p className="text-sm text-gray-400 mb-6">Try different keywords or remove filters</p>
              <button
                onClick={() => { setSearch(''); setCategory('all'); }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
              >
                Show all products
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              data-testid="products-grid"
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}
