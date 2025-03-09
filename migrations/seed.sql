-- Insert test users
-- Password is 'password123' hashed with bcrypt
INSERT INTO users (name, email, password, phone, address, role)
VALUES
    ('Admin User', 'admin@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmJ7WsZUVS6P.xpHQ3qPmJbOEwvqm', '1234567890', '123 Admin St', 'admin'),
    ('John Smith', 'john@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmJ7WsZUVS6P.xpHQ3qPmJbOEwvqm', '0987654321', '456 Customer Ave', 'customer'),
    ('Jane Doe', 'jane@example.com', '$2a$10$CwTycUXWue0Thq9StjUM0uQxTmJ7WsZUVS6P.xpHQ3qPmJbOEwvqm', '5551234567', '789 User Blvd', 'customer');

-- Insert test orders
INSERT INTO orders (user_id, status, total_amount)
VALUES
    (2, 'delivered', 135.95),
    (2, 'pending', 42.99),
    (3, 'processing', 89.50);

-- Insert test order items
INSERT INTO order_items (order_id, product_name, quantity, price, total)
VALUES
    (1, 'Smartphone Case', 1, 25.99, 25.99),
    (1, 'Wireless Earbuds', 1, 109.96, 109.96),
    (2, 'USB Cable', 2, 9.99, 19.98),
    (2, 'Phone Charger', 1, 23.01, 23.01),
    (3, 'Bluetooth Speaker', 1, 89.50, 89.50);
