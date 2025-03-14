const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']]
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
};

const options = {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

const Order = sequelize.define(
  'Order',
  attributes,
  options,
);

const ServiceOrder = sequelize.define(
  'ServiceOrder',
  attributes,
  {
    ...options,
    schema: 'order_service_db',
  },
);

module.exports = process.env.SHOULD_USE_ORDER_SERVICE_SCHEMA
  ? ServiceOrder
  : Order;
