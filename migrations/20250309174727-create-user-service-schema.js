'use strict';

const SCHEMA_NAME = 'user_service_db';
const TABLE_NAME = 'users';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createSchema(SCHEMA_NAME, {
        transaction,
      });

      await queryInterface.createTable({
        tableName: TABLE_NAME,
        schema: SCHEMA_NAME,
      }, {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        role: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'customer'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, {
        transaction,
      });

      await queryInterface.addIndex(
        {
          tableName: 'users',
          schema: SCHEMA_NAME,
        },
        ['email'],
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      console.error(error);

      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable(`${SCHEMA_NAME}.users`, {
        transaction,
      });

      await queryInterface.dropSchema('user_service_db', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      console.error(error);

      throw error;
    }
  }
};
