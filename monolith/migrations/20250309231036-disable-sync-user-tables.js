'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop triggers
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS sync_user_to_user_service_trigger ON public.users;
        DROP TRIGGER IF EXISTS sync_user_service_to_user_trigger ON user_service_db.users;
      `, { transaction });

      // Drop functions
      await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS sync_user_to_user_service();
        DROP FUNCTION IF EXISTS sync_user_service_to_user();
        DROP FUNCTION IF EXISTS disable_user_sync_triggers();
        DROP FUNCTION IF EXISTS enable_user_sync_triggers();
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Add flag to disable triggers temporarily to avoid infinite loops
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION disable_user_sync_triggers() RETURNS VOID AS $$
        BEGIN
          SET session_replication_role = 'replica';
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE OR REPLACE FUNCTION enable_user_sync_triggers() RETURNS VOID AS $$
        BEGIN
          SET session_replication_role = 'origin';
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create function to handle user inserts/updates in public schema
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION sync_user_to_user_service()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Temporarily disable triggers to prevent recursion
          PERFORM disable_user_sync_triggers();
          
          IF TG_OP = 'INSERT' THEN
            INSERT INTO user_service_db.users (
              id, name, email, password, phone, address, role, created_at, updated_at
            ) VALUES (
              NEW.id, NEW.name, NEW.email, NEW.password, NEW.phone, NEW.address, NEW.role, NEW.created_at, NEW.updated_at
            );
          ELSIF TG_OP = 'UPDATE' THEN
            UPDATE user_service_db.users SET
              name = NEW.name,
              email = NEW.email,
              password = NEW.password,
              phone = NEW.phone,
              address = NEW.address,
              role = NEW.role,
              updated_at = NEW.updated_at
            WHERE id = NEW.id;
          ELSIF TG_OP = 'DELETE' THEN
            DELETE FROM user_service_db.users WHERE id = OLD.id;
          END IF;
          
          -- Re-enable triggers
          PERFORM enable_user_sync_triggers();
          
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create function to handle user inserts/updates in user_service_db schema
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE FUNCTION sync_user_service_to_user()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Temporarily disable triggers to prevent recursion
          PERFORM disable_user_sync_triggers();
          
          IF TG_OP = 'INSERT' THEN
            INSERT INTO public.users (
              id, name, email, password, phone, address, role, created_at, updated_at
            ) VALUES (
              NEW.id, NEW.name, NEW.email, NEW.password, NEW.phone, NEW.address, NEW.role, NEW.created_at, NEW.updated_at
            );
          ELSIF TG_OP = 'UPDATE' THEN
            UPDATE public.users SET
              name = NEW.name,
              email = NEW.email,
              password = NEW.password,
              phone = NEW.phone,
              address = NEW.address,
              role = NEW.role,
              updated_at = NEW.updated_at
            WHERE id = NEW.id;
          ELSIF TG_OP = 'DELETE' THEN
            DELETE FROM public.users WHERE id = OLD.id;
          END IF;
          
          -- Re-enable triggers
          PERFORM enable_user_sync_triggers();
          
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
      `, { transaction });

      // Create trigger for public.users table
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS sync_user_to_user_service_trigger ON public.users;
        
        CREATE TRIGGER sync_user_to_user_service_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION sync_user_to_user_service();
      `, { transaction });

      // Create trigger for user_service_db.users table
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS sync_user_service_to_user_trigger ON user_service_db.users;
        
        CREATE TRIGGER sync_user_service_to_user_trigger
        AFTER INSERT OR UPDATE OR DELETE ON user_service_db.users
        FOR EACH ROW
        EXECUTE FUNCTION sync_user_service_to_user();
      `, { transaction });

      // Synchronize existing data
      await queryInterface.sequelize.query(`
          SELECT disable_user_sync_triggers();

          -- Copy data from public to user_service_db
          INSERT INTO user_service_db.users (id, name, email, password, phone, address, role, created_at, updated_at)
          SELECT id, name, email, password, phone, address, role, created_at, updated_at
          FROM public.users
          ON CONFLICT (id) DO UPDATE
              SET name = EXCLUDED.name,
                  email = EXCLUDED.email,
                  password = EXCLUDED.password,
                  phone = EXCLUDED.phone,
                  address = EXCLUDED.address,
                  role = EXCLUDED.role,
                  updated_at = EXCLUDED.updated_at;

          SELECT enable_user_sync_triggers();
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
