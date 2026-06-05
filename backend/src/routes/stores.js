const router = require('express').Router();
const ctrl = require('../controllers/storeController');

// /geojson MUST be declared before /:id to prevent Express treating "geojson" as an id param
router.get('/geojson', ctrl.getGeoJSON);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

module.exports = router;
