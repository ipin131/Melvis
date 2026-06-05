const { validationResult } = require('express-validator');
const { CartItem, Product } = require('../models');

exports.getCart = async (req, res, next) => {
  try {
    const items = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product }],
    });
    res.json(items);
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { product_id, quantity = 1 } = req.body;
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = await CartItem.findOne({ where: { user_id: req.user.id, product_id } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json(existing);
    }
    const item = await CartItem.create({ user_id: req.user.id, product_id, quantity });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const item = await CartItem.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    item.quantity = req.body.quantity;
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Cart item not found' });
    await item.destroy();
    res.json({ message: 'Item removed' });
  } catch (err) { next(err); }
};
