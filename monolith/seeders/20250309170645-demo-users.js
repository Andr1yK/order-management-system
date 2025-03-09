'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Generate hashed password (same for all test users)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '1234567890',
        address: '123 Admin St',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '0987654321',
        address: '456 Customer Ave',
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: hashedPassword,
        phone: '5551234567',
        address: '789 User Blvd',
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['admin@example.com', 'john@example.com', 'jane@example.com']
      }
    }, {});
  }
};
