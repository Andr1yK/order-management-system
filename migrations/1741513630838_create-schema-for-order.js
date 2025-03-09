/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createSchema('orders_schema', {
    ifNotExists: true,
  });
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS orders_schema.orders
    (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER        NOT NULL,
        status       VARCHAR(20) DEFAULT 'pending',
        total_amount DECIMAL(10, 2) NOT NULL,
        created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users_schema.users (id) ON DELETE CASCADE
    );
  `);

  pgm.sql(`
      CREATE TABLE IF NOT EXISTS orders_schema.order_items
      (
          id           SERIAL PRIMARY KEY,
          order_id     INTEGER        NOT NULL,
          product_name VARCHAR(100)   NOT NULL,
          quantity     INTEGER        NOT NULL,
          price        DECIMAL(10, 2) NOT NULL,
          total        DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders_schema.orders (id) ON DELETE CASCADE
      );
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders_schema.orders(user_id);
  `);

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON orders_schema.order_items(order_id);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('orders_schema.order_items', {
    ifExists: true,
  });
  pgm.dropTable('orders_schema.orders', {
    ifExists: true,
  });
  pgm.dropSchema('orders_schema', {
    ifExists: true,
  });
};
