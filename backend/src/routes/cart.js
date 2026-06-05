const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/cartController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getCart);

router.post('/', [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product_id required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
], ctrl.addItem);

router.put('/:id', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
], ctrl.updateItem);

router.delete('/:id', ctrl.removeItem);

module.exports = router;
