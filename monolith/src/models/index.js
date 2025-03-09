const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define associations
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
    await Order.sync({ alter: false });
    await OrderItem.sync({ alter: false });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  Order,
  OrderItem,
  initializeTables
};
