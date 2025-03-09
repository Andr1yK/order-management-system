const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define associations
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
  onDelete: 'CASCADE'
});

Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
  onDelete: 'CASCADE'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

// Initialize tables if they don't exist
const initializeTables = async () => {
  try {
    await User.sync({ alter: false });
    await Order.sync({ alter: false });
    await OrderItem.sync({ alter: false });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  User,
  Order,
  OrderItem,
  initializeTables
};
