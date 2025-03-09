exports.up = pgm => {
  // Сід користувачів
  pgm.sql(`
    INSERT INTO users (name, email, password, phone, address, role)
    VALUES
      ('Admin User', 'admin@example.com', '$2a$10$vcR2CLsGbkSQu1w7ls4RY.UCQH528jNDna6tOJlbg5t9/jM0Zq1ta', '1234567890', '123 Admin St', 'admin'),
      ('John Smith', 'john@example.com', '$2a$10$vcR2CLsGbkSQu1w7ls4RY.UCQH528jNDna6tOJlbg5t9/jM0Zq1ta', '0987654321', '456 Customer Ave', 'customer'),
      ('Jane Doe', 'jane@example.com', '$2a$10$vcR2CLsGbkSQu1w7ls4RY.UCQH528jNDna6tOJlbg5t9/jM0Zq1ta', '5551234567', '789 User Blvd', 'customer')
    ON CONFLICT (email) DO NOTHING;
  `);

  // Сід замовлень
  pgm.sql(`
    INSERT INTO orders (user_id, status, total_amount)
    VALUES
      (2, 'delivered', 135.95),
      (2, 'pending', 42.99),
      (3, 'processing', 89.50)
    ON CONFLICT DO NOTHING;
  `);

  // Сід елементів замовлень
  pgm.sql(`
    INSERT INTO order_items (order_id, product_name, quantity, price, total)
    VALUES
      (1, 'Smartphone Case', 1, 25.99, 25.99),
      (1, 'Wireless Earbuds', 1, 109.96, 109.96),
      (2, 'USB Cable', 2, 9.99, 19.98),
      (2, 'Phone Charger', 1, 23.01, 23.01),
      (3, 'Bluetooth Speaker', 1, 89.50, 89.50)
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = pgm => {
  // Видалення тестових даних при відкаті
  pgm.sql(`DELETE FROM order_items WHERE order_id IN (1, 2, 3);`);
  pgm.sql(`DELETE FROM orders WHERE user_id IN (2, 3);`);
  pgm.sql(`DELETE FROM users WHERE email IN ('admin@example.com', 'john@example.com', 'jane@example.com');`);
};
