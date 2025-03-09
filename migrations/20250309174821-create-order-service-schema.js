'use strict';

const SCHEMA_NAME = 'order_service_db';
const ORDER_TABLE_NAME = 'orders';
const ORDER_ITEM_TABLE_NAME = 'order_items';

const USER_SERVICE_SCHEMA_NAME = 'user_service_db';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createSchema(SCHEMA_NAME, {
        transaction,
      });

      await queryInterface.createTable({
        tableName: ORDER_TABLE_NAME,
        schema: SCHEMA_NAME,
      }, {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'pending'
        },
        total_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
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

      await queryInterface.createTable({
        tableName: ORDER_ITEM_TABLE_NAME,
        schema: SCHEMA_NAME,
      }, {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        order_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'orders',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        product_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        total: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        }
      }, {
        transaction,
      });

      await queryInterface.addIndex(
        {
          tableName: ORDER_TABLE_NAME,
          schema: SCHEMA_NAME,
        },
        ['user_id'],
        {
          transaction,
        }
      );
      await queryInterface.addIndex(
        {
          tableName: ORDER_TABLE_NAME,
          schema: SCHEMA_NAME,
        },
        ['status'],
        {
          transaction,
        }
      );

      await queryInterface.addIndex(
        {
          tableName: ORDER_ITEM_TABLE_NAME,
          schema: SCHEMA_NAME,
        },
        ['order_id'],
        {
          transaction,
        },
      );

      // Add foreign key constraint
      await queryInterface.addConstraint({
        tableName: ORDER_TABLE_NAME,
        schema: SCHEMA_NAME,
      }, {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'fk_orders_user_id',
        references: {
          table: 'users',
          schema: USER_SERVICE_SCHEMA_NAME,
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        transaction,
      });

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
      await queryInterface.dropTable({
        tableName: ORDER_ITEM_TABLE_NAME,
        schema: SCHEMA_NAME,
      }, {
        transaction,
      });

      await queryInterface.dropTable({
        tableName: ORDER_TABLE_NAME,
        schema: SCHEMA_NAME,
      }, {
        transaction,
      });

      await queryInterface.dropSchema(SCHEMA_NAME, {
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
