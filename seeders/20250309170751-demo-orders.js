'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Find user ids
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email IN (\'john@example.com\', \'jane@example.com\')',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const johnId = users.find(user => user.id === 2)?.id || 2;
    const janeId = users.find(user => user.id === 3)?.id || 3;

    // Insert orders
    const orders = await queryInterface.bulkInsert('orders', [
      {
        user_id: johnId,
        status: 'delivered',
        total_amount: 135.95,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: johnId,
        status: 'pending',
        total_amount: 42.99,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: janeId,
        status: 'processing',
        total_amount: 89.50,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    return orders;
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await queryInterface.bulkDelete('orders', null, {});
  }
};
