const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
};

const options = {
  tableName: 'order_items',
  timestamps: false
};

const OrderItem = sequelize.define(
  'OrderItem',
  attributes,
  options,
);

const ServiceOrderItem = sequelize.define(
  'ServiceOrderItem',
  attributes,
  {
    ...options,
    schema: 'order_service_db',
  },
);

module.exports = process.env.SHOULD_USE_ORDER_SERVICE_SCHEMA
  ? ServiceOrderItem
  : OrderItem;
