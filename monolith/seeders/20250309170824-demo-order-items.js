'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Get order IDs
    const orders = await queryInterface.sequelize.query(
      'SELECT id FROM orders LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (orders.length < 3) {
      console.warn('Not enough orders found for seeding order items');
      return;
    }

    const order1Id = orders[0].id;
    const order2Id = orders[1].id;
    const order3Id = orders[2].id;

    await queryInterface.bulkInsert('order_items', [
      {
        order_id: order1Id,
        product_name: 'Smartphone Case',
        quantity: 1,
        price: 25.99,
        total: 25.99
      },
      {
        order_id: order1Id,
        product_name: 'Wireless Earbuds',
        quantity: 1,
        price: 109.96,
        total: 109.96
      },
      {
        order_id: order2Id,
        product_name: 'USB Cable',
        quantity: 2,
        price: 9.99,
        total: 19.98
      },
      {
        order_id: order2Id,
        product_name: 'Phone Charger',
        quantity: 1,
        price: 23.01,
        total: 23.01
      },
      {
        order_id: order3Id,
        product_name: 'Bluetooth Speaker',
        quantity: 1,
        price: 89.50,
        total: 89.50
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await queryInterface.bulkDelete('order_items', null, {});
  }
};
