const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], ctrl.register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], ctrl.login);

router.get('/me', authenticate, ctrl.me);

module.exports = router;
