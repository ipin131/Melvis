const { Store } = require('../models');

const stores = [
  // ─── JAKARTA & SEKITARNYA (8) ─────────────────────────────────────────────
  {
    name: 'ShopEase Grand Indonesia',
    address: 'Jl. M.H. Thamrin No. 1, Menteng, Jakarta Pusat 10310',
    lat: -6.1954, lng: 106.8231,
    phone: '021-2358-1001', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase FX Sudirman',
    address: 'Jl. Jend. Sudirman Kav. 25, Senayan, Jakarta Selatan 12920',
    lat: -6.2267, lng: 106.8082,
    phone: '021-2358-1002', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Kelapa Gading',
    address: 'Jl. Boulevard Barat Raya, Kelapa Gading, Jakarta Utara 14240',
    lat: -6.1601, lng: 106.9054,
    phone: '021-2358-1003', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Pondok Indah',
    address: 'Jl. Metro Pondok Indah, Pondok Pinang, Jakarta Selatan 12310',
    lat: -6.2638, lng: 106.7840,
    phone: '021-2358-1004', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Mall Taman Anggrek',
    address: 'Jl. Letjen S. Parman Kav. 21, Tanjung Duren, Jakarta Barat 11470',
    lat: -6.1772, lng: 106.7909,
    phone: '021-2358-1011', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Bekasi',
    address: 'Jl. Ahmad Yani No. 1, Bekasi Selatan 17141',
    lat: -6.2349, lng: 106.9943,
    phone: '021-2358-1005', hours: 'Senin–Sabtu 09:00–21:00', category: 'Standalone',
  },
  {
    name: 'ShopEase Tangerang City Mall',
    address: 'Jl. Jend. Sudirman No. 1, Tangerang 15111',
    lat: -6.1781, lng: 106.6412,
    phone: '021-2358-1006', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Depok',
    address: 'Jl. Margonda Raya No. 99, Beji, Depok 16431',
    lat: -6.3993, lng: 106.8100,
    phone: '021-2358-1007', hours: 'Senin–Sabtu 09:00–21:00', category: 'Standalone',
  },

  // ─── JAWA BARAT ──────────────────────────────────────────────────────────────
  {
    name: 'ShopEase Bogor',
    address: 'Jl. Juanda No. 30, Bogor Tengah 16121',
    lat: -6.5961, lng: 106.8012,
    phone: '0251-2358-1008', hours: 'Senin–Sabtu 09:00–21:00', category: 'Standalone',
  },
  {
    name: 'ShopEase Bandung Paris Van Java',
    address: 'Jl. Sukajadi No. 137-139, Bandung 40162',
    lat: -6.8935, lng: 107.5975,
    phone: '022-2358-1009', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Bandung BIP',
    address: 'Jl. Merdeka No. 56, Sumur Bandung, Bandung 40113',
    lat: -6.9175, lng: 107.6090,
    phone: '022-2358-1012', hours: 'Senin–Minggu 10:00–21:30', category: 'Mall',
  },

  // ─── JAWA TENGAH & DIY ───────────────────────────────────────────────────────
  {
    name: 'ShopEase Yogyakarta Hartono',
    address: 'Ring Road Utara, Maguwoharjo, Depok, Sleman, D.I. Yogyakarta 55282',
    lat: -7.7527, lng: 110.4178,
    phone: '0274-2358-1013', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Yogyakarta Malioboro',
    address: 'Jl. Malioboro No. 52-58, Gedongtengen, Yogyakarta 55271',
    lat: -7.7922, lng: 110.3660,
    phone: '0274-2358-1014', hours: 'Senin–Minggu 09:00–21:00', category: 'Standalone',
  },
  {
    name: 'ShopEase Semarang Paragon',
    address: 'Jl. Pemuda No. 118, Sekayu, Semarang Tengah 50132',
    lat: -6.9877, lng: 110.4189,
    phone: '024-2358-1015', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Semarang DP Mall',
    address: 'Jl. Pemuda No. 150, Semarang Tengah 50131',
    lat: -7.0078, lng: 110.4217,
    phone: '024-2358-1016', hours: 'Senin–Minggu 10:00–21:30', category: 'Mall',
  },

  // ─── JAWA TIMUR ──────────────────────────────────────────────────────────────
  {
    name: 'ShopEase Surabaya Tunjungan Plaza',
    address: 'Jl. Basuki Rahmat No. 8-12, Embong Kaliasin, Surabaya 60271',
    lat: -7.2574, lng: 112.7382,
    phone: '031-2358-1017', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Surabaya Galaxy Mall',
    address: 'Jl. Dharmahusada Indah Timur No. 35, Mulyorejo, Surabaya 60115',
    lat: -7.2860, lng: 112.7740,
    phone: '031-2358-1018', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Surabaya Ciputra World',
    address: 'Jl. Mayjend Sungkono No. 89, Dukuhpakis, Surabaya 60225',
    lat: -7.2789, lng: 112.7312,
    phone: '031-2358-1019', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },

  // ─── SUMATERA ────────────────────────────────────────────────────────────────
  {
    name: 'ShopEase Medan Sun Plaza',
    address: 'Jl. K.H. Zainul Arifin No. 7, Petisah Tengah, Medan Petisah 20112',
    lat: 3.5897, lng: 98.6664,
    phone: '061-2358-1020', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Medan Grand Palladium',
    address: 'Jl. Kapt. Maulana Lubis No. 8, Petisah Hulu, Medan 20111',
    lat: 3.6041, lng: 98.6786,
    phone: '061-2358-1021', hours: 'Senin–Minggu 10:00–21:30', category: 'Mall',
  },
  {
    name: 'ShopEase Palembang Square',
    address: 'Jl. POM IX No. 1, Lorok Pakjo, Ilir Barat I, Palembang 30137',
    lat: -2.9836, lng: 104.7561,
    phone: '0711-2358-1022', hours: 'Senin–Minggu 10:00–21:00', category: 'Mall',
  },

  // ─── SULAWESI ────────────────────────────────────────────────────────────────
  {
    name: 'ShopEase Makassar Trans Studio Mall',
    address: 'Jl. Metro Tanjung Bunga, Maccini Sombala, Tamalate, Makassar 90224',
    lat: -5.1566, lng: 119.4120,
    phone: '0411-2358-1023', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Makassar Mall Panakkukang',
    address: 'Jl. Boulevard No. 2689, Masale, Panakkukang, Makassar 90231',
    lat: -5.1394, lng: 119.4326,
    phone: '0411-2358-1024', hours: 'Senin–Minggu 10:00–21:30', category: 'Mall',
  },

  // ─── BALI ─────────────────────────────────────────────────────────────────────
  {
    name: 'ShopEase Bali Beachwalk',
    address: 'Jl. Pantai Kuta No. 1, Kuta, Badung, Bali 80361',
    lat: -8.7183, lng: 115.1700,
    phone: '0361-2358-1025', hours: 'Senin–Minggu 10:00–22:00', category: 'Mall',
  },
  {
    name: 'ShopEase Bali Mal Galeria',
    address: 'Jl. Bypass Ngurah Rai No. 21, Kedonganan, Kuta, Badung 80361',
    lat: -8.6906, lng: 115.1768,
    phone: '0361-2358-1026', hours: 'Senin–Minggu 10:00–21:30', category: 'Mall',
  },

  // ─── WAREHOUSE ────────────────────────────────────────────────────────────────
  {
    name: 'ShopEase Warehouse Jakarta Timur',
    address: 'Kawasan Industri Pulogadung, Cakung, Jakarta Timur 13920',
    lat: -6.1864, lng: 106.9131,
    phone: '021-2358-1010', hours: 'Senin–Jumat 08:00–17:00', category: 'Warehouse',
  },
  {
    name: 'ShopEase Warehouse Surabaya',
    address: 'Kawasan SIER, Jl. Rungkut Industri Raya, Surabaya 60293',
    lat: -7.3425, lng: 112.7738,
    phone: '031-2358-1027', hours: 'Senin–Jumat 08:00–17:00', category: 'Warehouse',
  },
];

async function seed() {
  await Store.destroy({ where: {} });
  await Store.bulkCreate(stores);
  console.log(`Seeded ${stores.length} stores`);
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
  const { sequelize } = require('../models');
  sequelize.authenticate()
    .then(() => sequelize.sync({ alter: true }))
    .then(seed)
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { seed };
