const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Store', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    address: { type: DataTypes.STRING(500), allowNull: false },
    lat: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
    lng: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
    phone: { type: DataTypes.STRING(30) },
    hours: { type: DataTypes.STRING(100) },
    category: {
      type: DataTypes.ENUM('Mall', 'Standalone', 'Warehouse'),
      defaultValue: 'Standalone',
    },
  }, { tableName: 'stores', timestamps: true });
};
