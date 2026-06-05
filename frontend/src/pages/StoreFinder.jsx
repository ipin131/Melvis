import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';

// ── Warna per kategori ────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Mall:       '#2563eb', // blue
  Standalone: '#16a34a', // green
  Warehouse:  '#d97706', // amber
};

// ── Custom pin icon pakai L.DivIcon ───────────────────────────────────────────
function createPinIcon(category, isActive = false) {
  const color = CATEGORY_COLORS[category] || '#6b7280';
  const size = isActive ? 36 : 28;
  return new L.DivIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px">
        <div style="
          width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);background:${color};
          border:${isActive ? 3 : 2.5}px solid white;
          box-shadow:0 ${isActive ? 4 : 2}px ${isActive ? 10 : 6}px rgba(0,0,0,.4)">
        </div>
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-55%,-65%);
          width:${Math.round(size * 0.33)}px;height:${Math.round(size * 0.33)}px;
          background:white;border-radius:50%">
        </div>
      </div>`,
  });
}

// ── FlyTo helper ─────────────────────────────────────────────────────────────
function FlyToStore({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 1.1 });
  }, [target, map]);
  return null;
}

// ── Popup HTML builder ────────────────────────────────────────────────────────
function buildPopupHTML(p, lat, lng) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const badgeColor = p.category === 'Mall' ? '#2563eb' : p.category === 'Standalone' ? '#16a34a' : '#d97706';
  return `
    <div style="min-width:230px;font-family:system-ui,sans-serif">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="
          background:${badgeColor};color:white;font-size:10px;font-weight:700;
          padding:2px 8px;border-radius:999px">${p.category}</span>
      </div>
      <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#111">${p.name}</p>
      <p style="font-size:12px;color:#555;margin:0 0 3px;line-height:1.4">${p.address}</p>
      <p style="font-size:12px;color:#777;margin:0 0 2px">📞 ${p.phone}</p>
      <p style="font-size:12px;color:#777;margin:0 0 10px">🕐 ${p.hours}</p>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;background:#2563eb;color:white;font-size:11px;
                font-weight:600;padding:5px 12px;border-radius:8px;text-decoration:none">
        🗺️ Get Directions
      </a>
    </div>`;
}

const CATEGORY_BADGE = {
  Mall:       'bg-blue-100 text-blue-700',
  Standalone: 'bg-green-100 text-green-700',
  Warehouse:  'bg-amber-100 text-amber-700',
};

// Center of Indonesia ─ for default view
const INDONESIA_CENTER = [-2.5, 117.5];
const INDONESIA_ZOOM = 5;

export default function StoreFinder() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [flyTarget, setFlyTarget] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const layerRefs = useRef({});  // store id → Leaflet layer

  useEffect(() => {
    // Fetch as proper GeoJSON FeatureCollection from /api/stores/geojson
    api.get('/stores/geojson')
      .then((res) => setGeojsonData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Filter GeoJSON features based on search + category ─────────────────────
  const filteredGeoJSON = useMemo(() => {
    if (!geojsonData) return null;
    return {
      ...geojsonData,
      features: geojsonData.features.filter((f) => {
        const p = f.properties;
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.address.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
        return matchSearch && matchCat;
      }),
    };
  }, [geojsonData, search, categoryFilter]);

  // ── Flat list of visible stores (for sidebar cards) ────────────────────────
  const filteredStores = useMemo(
    () =>
      (filteredGeoJSON?.features ?? []).map((f) => ({
        id: f.properties.id,
        ...f.properties,
        // Convert GeoJSON [lng, lat] back to { lat, lng }
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      })),
    [filteredGeoJSON]
  );

  // ── key to force GeoJSON layer re-render when filter changes ───────────────
  const geojsonKey = useMemo(
    () => filteredStores.map((s) => s.id).join(',') + categoryFilter,
    [filteredStores, categoryFilter]
  );

  const handleStoreClick = (store) => {
    setActiveId(store.id);
    setFlyTarget([store.lat, store.lng]);
    setTimeout(() => layerRefs.current[store.id]?.openPopup(), 1200);
  };

  // ── pointToLayer: convert GeoJSON Point to Leaflet Marker ─────────────────
  const pointToLayer = (feature, latlng) => {
    const isActive = feature.properties.id === activeId;
    const marker = L.marker(latlng, {
      icon: createPinIcon(feature.properties.category, isActive),
    });
    layerRefs.current[feature.properties.id] = marker;
    return marker;
  };

  // ── onEachFeature: bind popup + click handler ──────────────────────────────
  const onEachFeature = (feature, layer) => {
    const p = feature.properties;
    const lat = feature.geometry.coordinates[1];
    const lng = feature.geometry.coordinates[0];
    layer.bindPopup(buildPopupHTML(p, lat, lng), { minWidth: 240 });
    layer.on('click', () => setActiveId(p.id));
  };

  // Count per category for the filter tabs
  const allFeatures = geojsonData?.features ?? [];
  const catCounts = allFeatures.reduce((acc, f) => {
    acc[f.properties.category] = (acc[f.properties.category] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Store Finder</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Temukan {allFeatures.length} toko Melvis di seluruh Indonesia
            &nbsp;·&nbsp;
            <span className="text-blue-600 font-medium">Data via GeoJSON API</span>
          </p>
        </div>

        {/* Format info banner */}
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-blue-900">GeoJSON FeatureCollection — RFC 7946</p>
            <p className="text-blue-700 mt-0.5">
              Data toko diambil dari <code className="bg-blue-100 px-1 rounded text-xs font-mono">GET /api/stores/geojson</code>
              &nbsp;sebagai GeoJSON FeatureCollection standar. Koordinat menggunakan urutan{' '}
              <code className="bg-blue-100 px-1 rounded text-xs font-mono">[longitude, latitude]</code>
              &nbsp;sesuai spesifikasi GeoJSON (berbeda dengan Leaflet yang pakai [lat, lng]).
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { cat: 'All', count: allFeatures.length, color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
            { cat: 'Mall', count: catCounts.Mall || 0, color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
            { cat: 'Standalone', count: catCounts.Standalone || 0, color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
            { cat: 'Warehouse', count: catCounts.Warehouse || 0, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
          ].map((s) => (
            <button
              key={s.cat}
              onClick={() => setCategoryFilter(s.cat)}
              className={`rounded-2xl p-3 text-center transition border-2 ${
                categoryFilter === s.cat ? 'border-blue-500 shadow-md' : 'border-transparent'
              } ${s.color}`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs font-semibold">{s.cat}</span>
              </div>
              <p className="text-2xl font-extrabold">{s.count}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* ── Sidebar ──────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama toko atau alamat…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="store-search"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white focus:bg-white transition"
              />
            </div>

            {/* Store cards */}
            <div
              className="space-y-2 overflow-y-auto"
              style={{ maxHeight: '540px' }}
              data-testid="store-list"
            >
              {filteredStores.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-1">Toko tidak ditemukan</p>
                  <p className="text-sm">Coba kata kunci lain</p>
                </div>
              ) : (
                filteredStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreClick(store)}
                    data-testid="store-card"
                    className={`w-full text-left bg-white rounded-2xl p-4 shadow-sm border-2 transition hover:shadow-md ${
                      activeId === store.id
                        ? 'border-blue-500 shadow-md'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm leading-tight" data-testid="store-name">
                        {store.name}
                      </p>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE[store.category] || 'bg-gray-100 text-gray-600'}`}>
                        {store.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{store.address}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {store.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {store.hours}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Petunjuk Arah →
                    </a>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 px-1">
              <span>{filteredStores.length} dari {allFeatures.length} toko ditampilkan</span>
              {search && (
                <button onClick={() => setSearch('')} className="text-blue-500 hover:underline">Clear search</button>
              )}
            </div>
          </div>

          {/* ── Map ──────────────────────────────────────────── */}
          <div
            className="lg:col-span-3 rounded-2xl overflow-hidden shadow-md border border-gray-200"
            style={{ height: '620px' }}
            data-testid="store-map"
          >
            <MapContainer
              center={INDONESIA_CENTER}
              zoom={INDONESIA_ZOOM}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <FlyToStore target={flyTarget} />

              {/* GeoJSON layer — key forces re-mount when filter changes */}
              {filteredGeoJSON && (
                <GeoJSON
                  key={geojsonKey}
                  data={filteredGeoJSON}
                  pointToLayer={pointToLayer}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">Legend:</span>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5">
              <span style={{ background: color }} className="inline-block w-3 h-3 rounded-full shadow-sm" />
              {cat}
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-auto">
            Format peta: OpenStreetMap · Data: GeoJSON RFC 7946
          </span>
        </div>
      </div>
    </div>
  );
}
