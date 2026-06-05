const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'shipped', 'delivered'),
      defaultValue: 'pending',
    },
    snap_token: { type: DataTypes.STRING(255) },
    midtrans_order_id: { type: DataTypes.STRING(100), unique: true },
    delivery_lat: { type: DataTypes.DECIMAL(10, 8) },
    delivery_lng: { type: DataTypes.DECIMAL(11, 8) },
    delivery_address: { type: DataTypes.STRING(500) },
  }, { tableName: 'orders', timestamps: true });
};
