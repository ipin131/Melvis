const midtransClient = require('midtrans-client');
const { CartItem, Product, Order, OrderItem, User } = require('../models');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

exports.createOrder = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product }],
    });

    if (!cartItems.length) return res.status(400).json({ message: 'Cart is empty' });

    for (const item of cartItems) {
      if (item.Product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${item.Product.name}"` });
      }
    }

    const total = cartItems.reduce((sum, i) => sum + parseFloat(i.Product.price) * i.quantity, 0);
    const midtransOrderId = `ORDER-${user.id}-${Date.now()}`;

    const { delivery_lat, delivery_lng, delivery_address } = req.body;
    const order = await Order.create({
      user_id: user.id,
      total_amount: total,
      midtrans_order_id: midtransOrderId,
      delivery_lat: delivery_lat || null,
      delivery_lng: delivery_lng || null,
      delivery_address: delivery_address || null,
    });

    await Promise.all(cartItems.map((item) =>
      OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.Product.price,
        product_name: item.Product.name,
      })
    ));

    let snapToken = null;
    try {
      const tx = await snap.createTransaction({
        transaction_details: { order_id: midtransOrderId, gross_amount: Math.round(total) },
        customer_details: { first_name: user.name, email: user.email },
        item_details: cartItems.map((item) => ({
          id: String(item.product_id),
          price: Math.round(parseFloat(item.Product.price)),
          quantity: item.quantity,
          name: item.Product.name,
        })),
      });
      snapToken = tx.token;
      order.snap_token = snapToken;
      await order.save();
    } catch (midtransErr) {
      // If Midtrans keys not configured, continue without snap_token (demo fallback)
      console.warn('Midtrans error (using demo fallback):', midtransErr.message);
    }

    await CartItem.destroy({ where: { user_id: user.id } });

    res.status(201).json({ order_id: order.id, snap_token: snapToken, total_amount: total });
  } catch (err) { next(err); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};

exports.handleNotification = async (req, res, next) => {
  try {
    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status } = notification;

    const order = await Order.findOne({ where: { midtrans_order_id: order_id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (transaction_status === 'capture') {
      order.status = fraud_status === 'challenge' ? 'pending' : 'paid';
    } else if (transaction_status === 'settlement') {
      order.status = 'paid';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      order.status = 'cancelled';
    } else if (transaction_status === 'pending') {
      order.status = 'pending';
    }

    await order.save();
    res.json({ message: 'OK' });
  } catch (err) { next(err); }
};
