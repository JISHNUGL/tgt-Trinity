-- B2B Enhanced Features Database Updates

-- Volume pricing tiers
CREATE TABLE volume_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  min_quantity INT NOT NULL,
  max_quantity INT,
  discount_percentage DECIMAL(5,2) NOT NULL,
  b2b_only BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Quote requests
CREATE TABLE quote_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  items TEXT NOT NULL, -- JSON array of requested items
  shipping_address TEXT,
  notes TEXT,
  status ENUM('pending', 'quoted', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  quoted_amount DECIMAL(10,2),
  valid_until TIMESTAMP NULL,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Quote items
CREATE TABLE quote_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote_request_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Repeated orders (quick reorder)
CREATE TABLE repeated_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_order_id INT NOT NULL,
  order_name VARCHAR(255) NOT NULL,
  items TEXT NOT NULL, -- JSON array of order items
  total_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_ordered TIMESTAMP NULL,
  order_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (original_order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- B2B customer preferences
CREATE TABLE b2b_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  default_payment_method VARCHAR(50),
  default_shipping_address TEXT,
  billing_address TEXT,
  preferred_contact_method ENUM('email', 'phone', 'both') DEFAULT 'email',
  order_frequency ENUM('weekly', 'biweekly', 'monthly', 'quarterly') DEFAULT 'monthly',
  auto_reorder BOOLEAN DEFAULT FALSE,
  reorder_threshold_days INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- B2B order templates
CREATE TABLE order_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  items TEXT NOT NULL, -- JSON array of template items
  is_default BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_volume_pricing_product_id ON volume_pricing(product_id);
CREATE INDEX idx_volume_pricing_quantity ON volume_pricing(min_quantity, max_quantity);
CREATE INDEX idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_request_id);
CREATE INDEX idx_quote_items_product_id ON quote_items(product_id);
CREATE INDEX idx_repeated_orders_user_id ON repeated_orders(user_id);
CREATE INDEX idx_repeated_orders_active ON repeated_orders(is_active);
CREATE INDEX idx_b2b_preferences_user_id ON b2b_preferences(user_id);
CREATE INDEX idx_order_templates_user_id ON order_templates(user_id);

-- Insert sample volume pricing data
INSERT INTO volume_pricing (product_id, min_quantity, max_quantity, discount_percentage) VALUES
(1, 10, 49, 5.00),
(1, 50, 99, 10.00),
(1, 100, 499, 15.00),
(1, 500, NULL, 20.00),
(2, 5, 24, 3.00),
(2, 25, 99, 7.00),
(2, 100, NULL, 12.00),
(3, 20, 99, 8.00),
(3, 100, 299, 12.00),
(3, 300, NULL, 18.00);

-- Create views for B2B functionality
CREATE VIEW b2b_product_pricing AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.price as base_price,
  p.stock_quantity,
  CASE 
    WHEN u.role = 'b2b' AND u.b2b_approved = TRUE THEN 
      GREATEST(
        COALESCE(MIN(vp.discount_percentage), 0),
        5.00 -- Minimum B2B discount
      )
    ELSE 0 
  END as b2b_discount_percentage,
  CASE 
    WHEN u.role = 'b2b' AND u.b2b_approved = TRUE THEN
      p.price * (1 - GREATEST(COALESCE(MIN(vp.discount_percentage), 0), 5.00) / 100)
    ELSE p.price 
  END as b2b_price,
  c.name as category_name
FROM products p
CROSS JOIN users u 
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN volume_pricing vp ON p.id = vp.product_id 
  AND (vp.max_quantity IS NULL OR vp.max_quantity >= 1)
WHERE u.role = 'b2b' AND u.b2b_approved = TRUE
GROUP BY p.id, p.name, p.price, p.stock_quantity, c.name, u.role, u.b2b_approved;

-- Stored procedures for B2B operations
DELIMITER //

CREATE PROCEDURE CalculateB2BPrice(
  IN product_id INT,
  IN quantity INT,
  IN user_id INT
)
BEGIN
  DECLARE base_price DECIMAL(10,2);
  DECLARE discount_percentage DECIMAL(5,2);
  DECLARE final_price DECIMAL(10,2);
  DECLARE user_role VARCHAR(20);
  DECLARE b2b_approved BOOLEAN;
  
  -- Get user info
  SELECT role, b2b_approved INTO user_role, b2b_approved 
  FROM users WHERE id = user_id;
  
  -- Get base price
  SELECT price INTO base_price FROM products WHERE id = product_id;
  
  -- Calculate discount for B2B users
  IF user_role = 'b2b' AND b2b_approved = TRUE THEN
    SELECT COALESCE(MAX(discount_percentage), 5.00) INTO discount_percentage
    FROM volume_pricing 
    WHERE product_id = product_id 
      AND min_quantity <= quantity 
      AND (max_quantity IS NULL OR max_quantity >= quantity);
      
    SET final_price = base_price * (1 - discount_percentage / 100);
  ELSE
    SET final_price = base_price;
    SET discount_percentage = 0;
  END IF;
  
  SELECT 
    base_price,
    discount_percentage,
    final_price;
END//

CREATE PROCEDURE CreateQuoteFromCart(
  IN user_id INT,
  IN business_name VARCHAR(255),
  IN contact_person VARCHAR(255),
  IN email VARCHAR(255),
  IN phone VARCHAR(20),
  IN shipping_address TEXT,
  IN notes TEXT
)
BEGIN
  DECLARE quote_id INT;
  
  -- Create quote request
  INSERT INTO quote_requests (
    user_id, business_name, contact_person, email, phone, 
    shipping_address, notes, status
  ) VALUES (
    user_id, business_name, contact_person, email, phone,
    shipping_address, notes, 'pending'
  );
  
  SET quote_id = LAST_INSERT_ID();
  
  -- Add cart items to quote
  INSERT INTO quote_items (quote_request_id, product_id, quantity, unit_price, total_price)
  SELECT 
    quote_id,
    c.product_id,
    c.quantity,
    p.price,
    p.price * c.quantity
  FROM cart c
  JOIN products p ON c.product_id = p.id
  WHERE c.user_id = user_id;
  
  SELECT quote_id as new_quote_id;
END//

DELIMITER ;

-- Triggers for B2B functionality
DELIMITER //

CREATE TRIGGER after_order_complete_for_repeat_orders
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update repeated order usage if this was a reorder
    UPDATE repeated_orders 
    SET last_ordered = NOW(),
        order_count = order_count + 1
    WHERE user_id = NEW.user_id 
      AND JSON_CONTAINS(items, JSON_OBJECT('product_id', NEW.id));
  END IF;
END//

CREATE TRIGGER update_quote_status_on_expiry
BEFORE INSERT ON quote_requests
FOR EACH ROW
BEGIN
  -- Set valid_until to 30 days from creation if not specified
  IF NEW.valid_until IS NULL AND NEW.status = 'quoted' THEN
    SET NEW.valid_until = DATE_ADD(NOW(), INTERVAL 30 DAY);
  END IF;
END//

DELIMITER ;
