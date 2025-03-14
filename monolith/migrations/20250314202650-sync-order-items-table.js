'use strict';

const SERVICE_DB = 'order_service_db';
const TABLE_NAME = 'order_items';

const DISABLE_TRIGGER = `disable_${TABLE_NAME}_sync_triggers`;
const ENABLE_TRIGGER = `enable_${TABLE_NAME}_sync_triggers`

const SYNC_TO_SERVICE_DB_TRIGGER = `sync_${TABLE_NAME}_to_${TABLE_NAME}_service_trigger`;
const SYNC_FROM_SERVICE_DB_TRIGGER = `sync_${TABLE_NAME}_service_to_${TABLE_NAME}_trigger`

const SYNC_TO_SERVICE_DB_FUNCTION = `sync_${TABLE_NAME}_to_${TABLE_NAME}_service`;
const SYNC_FROM_SERVICE_DB_FUNCTION = `sync_${TABLE_NAME}_service_to_${TABLE_NAME}`

const TABLE_COLUMNS = {
  id: {
    updatable: false,
  },
  order_id: {
    updatable: true,
  },
  product_name: {
    updatable: true,
  },
  quantity: {
    updatable: true,
  },
  price: {
    updatable: true,
  },
  total: {
    updatable: true,
  }
};

const TABLE_COLUMNS_LIST = Object.keys(TABLE_COLUMNS);

const UPDATABLE_COLUMNS = Object.entries(TABLE_COLUMNS)
  .filter(([_, { updatable }]) => updatable)
  .map(([column]) => column);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add flag to disable triggers temporarily to avoid infinite loops
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION ${DISABLE_TRIGGER}() RETURNS VOID AS $$
        BEGIN
          SET session_replication_role = 'replica';
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE OR REPLACE FUNCTION ${ENABLE_TRIGGER}() RETURNS VOID AS $$
        BEGIN
          SET session_replication_role = 'origin';
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create function to handle order inserts/updates in public schema
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION ${SYNC_TO_SERVICE_DB_FUNCTION}()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Temporarily disable triggers to prevent recursion
          PERFORM ${DISABLE_TRIGGER}();
          
          IF TG_OP = 'INSERT' THEN
            INSERT INTO ${SERVICE_DB}.${TABLE_NAME} (
              ${TABLE_COLUMNS_LIST.join(', ')}
            ) VALUES (
              ${TABLE_COLUMNS_LIST.map(column => `NEW.${column}`).join(', ')}
            );
          ELSIF TG_OP = 'UPDATE' THEN
            UPDATE ${SERVICE_DB}.${TABLE_NAME} SET
              ${UPDATABLE_COLUMNS.map(column => `${column} = NEW.${column}`).join(', ')}
            WHERE id = NEW.id;
          ELSIF TG_OP = 'DELETE' THEN
            DELETE FROM ${SERVICE_DB}.${TABLE_NAME} WHERE id = OLD.id;
          END IF;
          
          -- Re-enable triggers
          PERFORM ${ENABLE_TRIGGER}();
          
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create function to handle order inserts/updates in service schema
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION ${SYNC_FROM_SERVICE_DB_FUNCTION}()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Temporarily disable triggers to prevent recursion
          PERFORM ${DISABLE_TRIGGER}();
          
          IF TG_OP = 'INSERT' THEN
            INSERT INTO public.${TABLE_NAME} (
              ${TABLE_COLUMNS_LIST.join(', ')}
            ) VALUES (
              ${TABLE_COLUMNS_LIST.map(column => `NEW.${column}`).join(', ')}
            );
          ELSIF TG_OP = 'UPDATE' THEN
            UPDATE public.${TABLE_NAME} SET
              ${UPDATABLE_COLUMNS.map(column => `${column} = NEW.${column}`).join(', ')}
            WHERE id = NEW.id;
          ELSIF TG_OP = 'DELETE' THEN
            DELETE FROM public.${TABLE_NAME} WHERE id = OLD.id;
          END IF;
          
          -- Re-enable triggers
          PERFORM ${ENABLE_TRIGGER}();
          
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create trigger for public table
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS ${SYNC_TO_SERVICE_DB_TRIGGER} ON public.${TABLE_NAME};
        
        CREATE TRIGGER ${SYNC_TO_SERVICE_DB_TRIGGER}
        AFTER INSERT OR UPDATE OR DELETE ON public.${TABLE_NAME}
        FOR EACH ROW
        EXECUTE FUNCTION ${SYNC_TO_SERVICE_DB_FUNCTION}();
      `, { transaction });

      // Create trigger for service db table
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS ${SYNC_FROM_SERVICE_DB_TRIGGER} ON ${SERVICE_DB}.${TABLE_NAME};
        
        CREATE TRIGGER ${SYNC_FROM_SERVICE_DB_TRIGGER}
        AFTER INSERT OR UPDATE OR DELETE ON ${SERVICE_DB}.${TABLE_NAME}
        FOR EACH ROW
        EXECUTE FUNCTION ${SYNC_FROM_SERVICE_DB_FUNCTION}();
      `, { transaction });

      // Synchronize existing data
      await queryInterface.sequelize.query(`
          SELECT ${DISABLE_TRIGGER}();

          -- Copy data from public to service db
          INSERT INTO ${SERVICE_DB}.${TABLE_NAME} (${TABLE_COLUMNS_LIST.join(', ')})
          SELECT ${TABLE_COLUMNS_LIST.join(', ')}
          FROM public.${TABLE_NAME}
          ON CONFLICT (id) DO UPDATE
              SET ${UPDATABLE_COLUMNS.map(column => `${column} = EXCLUDED.${column}`).join(', ')};

          SELECT ${ENABLE_TRIGGER}();
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();

      console.log(error);

      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop triggers
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS ${SYNC_TO_SERVICE_DB_TRIGGER} ON public.${TABLE_NAME};
        DROP TRIGGER IF EXISTS ${SYNC_FROM_SERVICE_DB_TRIGGER} ON ${SERVICE_DB}.${TABLE_NAME};
      `, { transaction });

      // Drop functions
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS ${SYNC_FROM_SERVICE_DB_FUNCTION}();
        DROP FUNCTION IF EXISTS ${SYNC_TO_SERVICE_DB_FUNCTION}();
        DROP FUNCTION IF EXISTS ${DISABLE_TRIGGER}();
        DROP FUNCTION IF EXISTS ${ENABLE_TRIGGER}();
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
