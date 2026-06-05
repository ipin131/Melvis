import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);

// Red pulsing dot for selected delivery point
const deliveryIcon = new L.DivIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 0 0 3px rgba(239,68,68,.3)"></div>`,
});

// Captures map clicks and reports latlng to parent
function ClickCapture({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
}

const JAKARTA_CENTER = [-6.2088, 106.8456];

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Delivery map state
  const [showMap, setShowMap] = useState(false);
  const [deliveryLoc, setDeliveryLoc] = useState(null);   // { lat, lng }
  const [deliveryAddr, setDeliveryAddr] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    api.get('/cart')
      .then((res) => {
        if (!res.data.length) navigate('/cart');
        setItems(res.data);
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const total = items.reduce((sum, i) => sum + (parseFloat(i.Product?.price) || 0) * i.quantity, 0);

  const handleMapPick = async (latlng) => {
    setDeliveryLoc(latlng);
    setDeliveryAddr('');
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`,
        { headers: { 'Accept-Language': 'id,en' } }
      );
      const data = await res.json();
      setDeliveryAddr(data.display_name || '');
    } catch {
      setDeliveryAddr(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      const body = {};
      if (deliveryLoc) {
        body.delivery_lat = deliveryLoc.lat;
        body.delivery_lng = deliveryLoc.lng;
        body.delivery_address = deliveryAddr;
      }
      const res = await api.post('/orders', body);
      const { snap_token, order_id } = res.data;
      window.dispatchEvent(new Event('cartUpdated'));

      if (snap_token && window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: () => navigate(`/orders/${order_id}?status=success`),
          onPending: () => navigate(`/orders/${order_id}?status=pending`),
          onError: () => { setError('Payment failed. Please try again.'); setProcessing(false); },
          onClose: () => navigate(`/orders/${order_id}?status=pending`),
        });
      } else {
        navigate(`/orders/${order_id}?status=pending`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Order summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h2>
        <div className="divide-y" data-testid="checkout-items">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <img
                src={item.Product?.image_url}
                alt={item.Product?.name}
                className="w-14 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{item.Product?.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-gray-900 flex-shrink-0">
                {formatPrice((parseFloat(item.Product?.price) || 0) * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-bold text-blue-600" data-testid="checkout-total">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Customer Information</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="font-medium text-gray-600 w-16">Name</dt>
            <dd className="text-gray-800">{user?.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-gray-600 w-16">Email</dt>
            <dd className="text-gray-800">{user?.email}</dd>
          </div>
        </dl>
      </div>

      {/* ── Delivery Location (map picker) ── */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" data-testid="delivery-map-section">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 inline">Delivery Location</h2>
            <span className="ml-2 text-sm text-gray-400">(optional)</span>
          </div>
          <button
            onClick={() => setShowMap((v) => !v)}
            data-testid="toggle-map-button"
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            {showMap ? 'Hide map ▲' : 'Set on map ▼'}
          </button>
        </div>

        {deliveryLoc && !showMap && (
          <p className="text-sm text-gray-600 flex items-start gap-1.5 mt-1">
            <span className="text-red-500 mt-0.5">📍</span>
            <span className="line-clamp-2">{deliveryAddr || `${deliveryLoc.lat.toFixed(5)}, ${deliveryLoc.lng.toFixed(5)}`}</span>
          </p>
        )}

        {showMap && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-3">
              Click anywhere on the map to pin your delivery location.
            </p>

            {/* The map — fixed height is required by Leaflet */}
            <div style={{ height: '320px' }} className="rounded-xl overflow-hidden border border-gray-200">
              <MapContainer
                center={deliveryLoc ? [deliveryLoc.lat, deliveryLoc.lng] : JAKARTA_CENTER}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <ClickCapture onPick={handleMapPick} />
                {deliveryLoc && (
                  <Marker
                    position={[deliveryLoc.lat, deliveryLoc.lng]}
                    icon={deliveryIcon}
                  />
                )}
              </MapContainer>
            </div>

            {/* Result */}
            <div className="mt-3 min-h-[2.5rem] flex items-start gap-2">
              {geocoding && <span className="text-sm text-gray-400 animate-pulse">Fetching address…</span>}
              {!geocoding && deliveryLoc && (
                <>
                  <span className="text-red-500 mt-0.5 flex-shrink-0">📍</span>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{deliveryAddr || `${deliveryLoc.lat.toFixed(6)}, ${deliveryLoc.lng.toFixed(6)}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Lat: {deliveryLoc.lat.toFixed(6)} · Lng: {deliveryLoc.lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDeliveryLoc(null); setDeliveryAddr(''); }}
                    className="ml-auto text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                    data-testid="clear-location"
                  >
                    ✕ Clear
                  </button>
                </>
              )}
              {!geocoding && !deliveryLoc && (
                <span className="text-sm text-gray-400">No location selected yet.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm text-blue-700">
        <strong>Sandbox mode:</strong> This is a demo. Use Midtrans test card numbers — no real charges will be made.
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 text-sm" data-testid="checkout-error">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={processing}
        data-testid="pay-button"
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
      >
        {processing ? 'Processing…' : `Pay ${formatPrice(total)}`}
      </button>
    </div>
  );
}
