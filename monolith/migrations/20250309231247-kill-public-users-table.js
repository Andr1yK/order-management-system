'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeConstraint(
        {
          tableName: 'orders',
          schema: 'public',
        },
        'orders_user_id_fkey',
        {
          transaction,
        },
      );

      await queryInterface.removeConstraint(
        {
          tableName: 'orders',
          schema: 'order_service_db',
        },
'fk_orders_user_id',
        {
          transaction,
        },
      );

      await queryInterface.addConstraint({
        tableName: 'orders',
        schema: 'public',
      }, {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'orders_user_id_fkey',
        references: {
          table: {
            tableName: 'users',
            schema: 'user_service_db',
          },
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.addConstraint({
        tableName: 'orders',
        schema: 'order_service_db',
      }, {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'fk_orders_user_id',
        references: {
          table: {
            tableName: 'users',
            schema: 'user_service_db',
          },
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction,
      });

      await queryInterface.dropTable({
        tableName: 'users',
        schema: 'public',
      }, {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      console.error(error);

      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeConstraint(
        {
          tableName: 'orders',
          schema: 'public',
        },
        'orders_user_id_fkey',
        { transaction },
      );

      await queryInterface.createTable({
        tableName: 'users',
        schema: 'public',
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
      });

      await queryInterface.addIndex({
        tableName: 'users',
        schema: 'public',
      }, ['email']);

      await queryInterface.addConstraint({
        tableName: 'orders',
        schema: 'public',
      }, {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'orders_user_id_fkey',
        references: {
          table: {
            tableName: 'users',
            schema: 'public',
          },
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
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
