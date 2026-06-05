const { Op } = require('sequelize');
const { Product } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
    if (req.query.category) where.category = req.query.category;
    res.json(await Product.findAll({ where }));
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};
