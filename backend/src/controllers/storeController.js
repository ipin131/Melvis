const { Store } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const stores = await Store.findAll({ order: [['name', 'ASC']] });
    res.json(stores);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (err) { next(err); }
};

// Returns a proper GeoJSON FeatureCollection (RFC 7946)
// Note: GeoJSON coordinates use [longitude, latitude] order
exports.getGeoJSON = async (req, res, next) => {
  try {
    const stores = await Store.findAll({ order: [['name', 'ASC']] });
    const geojson = {
      type: 'FeatureCollection',
      features: stores.map((s) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(s.lng), parseFloat(s.lat)], // GeoJSON: [lng, lat]
        },
        properties: {
          id: s.id,
          name: s.name,
          address: s.address,
          phone: s.phone,
          hours: s.hours,
          category: s.category,
        },
      })),
    };
    res.json(geojson);
  } catch (err) { next(err); }
};
