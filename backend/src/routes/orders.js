const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const authenticate = require('../middleware/auth');

// Midtrans webhook — no auth, called by Midtrans servers
router.post('/notification', ctrl.handleNotification);

router.use(authenticate);
router.post('/', ctrl.createOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrder);

module.exports = router;
