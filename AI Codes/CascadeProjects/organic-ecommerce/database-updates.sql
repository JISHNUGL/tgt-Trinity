-- Additional database tables for enhanced functionality

-- Saved cards for recurring payments
CREATE TABLE saved_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number_hash VARCHAR(20) NOT NULL,
  cardholder_name VARCHAR(255) NOT NULL,
  expiry_month VARCHAR(2) NOT NULL,
  expiry_year VARCHAR(4) NOT NULL,
  billing_address TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment transactions log
CREATE TABLE payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Customer sessions for analytics
CREATE TABLE customer_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  page_views INT DEFAULT 1,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Product reviews
CREATE TABLE product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (product_id, user_id)
);

-- Wishlist functionality
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- Inventory tracking
CREATE TABLE inventory_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Email logs for debugging
CREATE TABLE email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template VARCHAR(100),
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_b2b_applications_status ON b2b_applications(status);
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);

-- Insert admin user (change password in production)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@organic-ecommerce.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Admin', 'User', 'admin');

-- Create views for common queries
CREATE VIEW order_summary AS
SELECT 
  o.id,
  o.order_number,
  o.user_id,
  o.total_amount,
  o.status,
  o.payment_status,
  o.created_at,
  u.first_name,
  u.last_name,
  u.email,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

CREATE VIEW product_summary AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock_quantity,
  c.name as category_name,
  COUNT(oi.id) as times_sold,
  COALESCE(SUM(oi.quantity), 0) as total_sold
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
GROUP BY p.id;

-- Stored procedures for common operations
DELIMITER //

CREATE PROCEDURE UpdateProductStock(
  IN product_id INT,
  IN quantity_change INT,
  IN reason VARCHAR(100),
  IN user_id INT
)
BEGIN
  DECLARE current_stock INT;
  
  SELECT stock_quantity INTO current_stock FROM products WHERE id = product_id;
  
  UPDATE products 
  SET stock_quantity = stock_quantity + quantity_change,
      updated_at = NOW()
  WHERE id = product_id;
  
  INSERT INTO inventory_log (
    product_id, 
    quantity_change, 
    previous_quantity, 
    new_quantity, 
    reason, 
    user_id
  ) VALUES (
    product_id, 
    quantity_change, 
    current_stock, 
    current_stock + quantity_change, 
    reason, 
    user_id
  );
END//

CREATE PROCEDURE GetCustomerStats(
  IN customer_id INT
)
BEGIN
  SELECT 
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.created_at) as last_order_date
  FROM orders o
  WHERE o.user_id = customer_id AND o.status != 'cancelled';
END//

DELIMITER ;

-- Triggers for data consistency
DELIMITER //

CREATE TRIGGER before_order_item_insert 
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE current_stock INT;
  
  SELECT stock_quantity INTO current_stock 
  FROM products 
  WHERE id = NEW.product_id;
  
  IF current_stock < NEW.quantity THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Insufficient stock for this order';
  END IF;
END//

CREATE TRIGGER after_order_item_insert 
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  INSERT INTO inventory_log (
    product_id, 
    quantity_change, 
    previous_quantity, 
    new_quantity, 
    reason, 
    user_id
  ) VALUES (
    NEW.product_id, 
    -NEW.quantity, 
    (SELECT stock_quantity + NEW.quantity FROM products WHERE id = NEW.product_id),
    (SELECT stock_quantity FROM products WHERE id = NEW.product_id),
    'Order placed',
    (SELECT user_id FROM orders WHERE id = NEW.order_id)
  );
END//

DELIMITER ;
