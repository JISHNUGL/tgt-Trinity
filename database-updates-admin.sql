-- Admin Panel Database Enhancements
-- Coupon System, Review & Rating System, Analytics, and Enhanced Management

-- Coupons Table
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    starts_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Coupon Usage Tracking
CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Product Reviews Table
CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Review Helpfulness Votes
CREATE TABLE review_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES product_reviews(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_review_vote (user_id, review_id)
);

-- Admin Activity Log
CREATE TABLE admin_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Analytics Summary Table (for faster dashboard loading)
CREATE TABLE analytics_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_customers INT DEFAULT 0,
    new_customers INT DEFAULT 0,
    total_products_sold INT DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer Support Tickets
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category VARCHAR(50),
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Support Ticket Replies
CREATE TABLE ticket_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Email Templates
CREATE TABLE email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Email Campaigns
CREATE TABLE email_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_id INT,
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    target_audience ENUM('all', 'customers', 'b2b', 'newsletter') DEFAULT 'all',
    status ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    opened_count INT DEFAULT 0,
    clicked_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (template_id) REFERENCES email_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Product Variants (for size, color, etc.)
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    weight DECIMAL(8,2) DEFAULT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_sku (sku)
);

-- Variant Options (like Size: M, L, XL or Color: Red, Blue, Green)
CREATE TABLE variant_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    option_name VARCHAR(50) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Wishlist
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- Inventory Adjustments
CREATE TABLE inventory_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    adjustment_type ENUM('increase', 'decrease', 'set') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    reference_type VARCHAR(50),
    reference_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Indexes for Performance
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_expires ON coupons(expires_at);
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);
CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_reviews_approved ON product_reviews(is_approved);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_admin_activity_admin ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_date ON admin_activity_log(created_at);
CREATE INDEX idx_analytics_date ON analytics_summary(date);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);

-- Views for Analytics
CREATE VIEW product_performance AS
SELECT 
    p.id,
    p.name,
    p.price,
    COUNT(oi.id) as total_orders,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(pr.rating) as average_rating,
    COUNT(pr.id) as review_count,
    p.stock_quantity,
    p.created_at
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = TRUE
GROUP BY p.id;

CREATE VIEW customer_lifetime_value AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as average_order_value,
    MIN(o.created_at) as first_order_date,
    MAX(o.created_at) as last_order_date,
    DATEDIFF(NOW(), MAX(o.created_at)) as days_since_last_order
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status != 'cancelled'
GROUP BY u.id;

-- Stored Procedures
DELIMITER //

-- Update Analytics Summary
CREATE PROCEDURE UpdateAnalyticsSummary(IN target_date DATE)
BEGIN
    DECLARE total_orders_count INT;
    DECLARE total_revenue_amount DECIMAL(10,2);
    DECLARE total_customers_count INT;
    DECLARE new_customers_count INT;
    DECLARE total_products_sold_count INT;
    DECLARE avg_order_value DECIMAL(10,2);
    DECLARE conversion_rate_value DECIMAL(5,4);
    
    -- Calculate metrics
    SELECT COUNT(*) INTO total_orders_count
    FROM orders 
    WHERE DATE(created_at) = target_date AND status != 'cancelled';
    
    SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue_amount
    FROM orders 
    WHERE DATE(created_at) = target_date AND status != 'cancelled';
    
    SELECT COUNT(DISTINCT user_id) INTO total_customers_count
    FROM orders 
    WHERE DATE(created_at) = target_date AND status != 'cancelled';
    
    SELECT COUNT(*) INTO new_customers_count
    FROM users 
    WHERE DATE(created_at) = target_date;
    
    SELECT COALESCE(SUM(oi.quantity), 0) INTO total_products_sold_count
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE DATE(o.created_at) = target_date AND o.status != 'cancelled';
    
    SELECT COALESCE(AVG(total_amount), 0) INTO avg_order_value
    FROM orders 
    WHERE DATE(created_at) = target_date AND status != 'cancelled';
    
    -- Calculate conversion rate (new customers / total visitors - simplified)
    SELECT 
        CASE 
            WHEN new_customers_count > 0 THEN new_customers_count / 100.0
            ELSE 0
        END INTO conversion_rate_value;
    
    -- Insert or update summary
    INSERT INTO analytics_summary (
        date, total_orders, total_revenue, total_customers, new_customers,
        total_products_sold, average_order_value, conversion_rate
    ) VALUES (
        target_date, total_orders_count, total_revenue_amount, total_customers_count,
        new_customers_count, total_products_sold_count, avg_order_value, conversion_rate_value
    )
    ON DUPLICATE KEY UPDATE
        total_orders = VALUES(total_orders),
        total_revenue = VALUES(total_revenue),
        total_customers = VALUES(total_customers),
        new_customers = VALUES(new_customers),
        total_products_sold = VALUES(total_products_sold),
        average_order_value = VALUES(average_order_value),
        conversion_rate = VALUES(conversion_rate);
END //

-- Apply Coupon to Order
CREATE PROCEDURE ApplyCoupon(
    IN order_id INT,
    IN coupon_code VARCHAR(50),
    IN user_id INT
)
BEGIN
    DECLARE coupon_id INT;
    DECLARE discount_type VARCHAR(20);
    DECLARE discount_value DECIMAL(10,2);
    DECLARE minimum_amount DECIMAL(10,2);
    DECLARE maximum_discount DECIMAL(10,2);
    DECLARE usage_limit INT;
    DECLARE usage_count INT;
    DECLARE is_active BOOLEAN;
    DECLARE expires_at TIMESTAMP;
    DECLARE order_total DECIMAL(10,2);
    DECLARE discount_amount DECIMAL(10,2);
    
    -- Get coupon details
    SELECT id, discount_type, discount_value, minimum_amount, maximum_discount,
           usage_limit, usage_count, is_active, expires_at
    INTO coupon_id, discount_type, discount_value, minimum_amount, maximum_discount,
         usage_limit, usage_count, is_active, expires_at
    FROM coupons
    WHERE code = coupon_code AND is_active = TRUE;
    
    -- Validate coupon
    IF coupon_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid coupon code';
    END IF;
    
    IF expires_at IS NOT NULL AND expires_at < NOW() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Coupon has expired';
    END IF;
    
    IF usage_limit IS NOT NULL AND usage_count >= usage_limit THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Coupon usage limit exceeded';
    END IF;
    
    -- Get order total
    SELECT total_amount INTO order_total
    FROM orders
    WHERE id = order_id AND user_id = user_id;
    
    IF order_total < minimum_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Minimum order amount not met';
    END IF;
    
    -- Calculate discount
    IF discount_type = 'percentage' THEN
        SET discount_amount = order_total * (discount_value / 100);
        IF maximum_discount IS NOT NULL AND discount_amount > maximum_discount THEN
            SET discount_amount = maximum_discount;
        END IF;
    ELSEIF discount_type = 'fixed_amount' THEN
        SET discount_amount = discount_value;
        IF discount_amount > order_total THEN
            SET discount_amount = order_total;
        END IF;
    ELSEIF discount_type = 'free_shipping' THEN
        SET discount_amount = 10.00; -- Fixed shipping cost
    END IF;
    
    -- Update order with discount
    UPDATE orders
    SET total_amount = total_amount - discount_amount,
        coupon_code = coupon_code,
        discount_amount = discount_amount
    WHERE id = order_id;
    
    -- Record coupon usage
    INSERT INTO coupon_usage (coupon_id, order_id, user_id, discount_amount)
    VALUES (coupon_id, order_id, user_id, discount_amount);
    
    -- Update coupon usage count
    UPDATE coupons
    SET usage_count = usage_count + 1
    WHERE id = coupon_id;
    
    SELECT discount_amount as applied_discount;
END //

DELIMITER ;

-- Triggers
DELIMITER //

-- Log Admin Activity
CREATE TRIGGER log_admin_activity_after_order_update
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO admin_activity_log (admin_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (
            NEW.updated_by,
            'UPDATE_STATUS',
            'order',
            NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status)
        );
    END IF;
END //

-- Update Product Rating
CREATE TRIGGER update_product_rating_after_review
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    UPDATE products
    SET rating = (
        SELECT AVG(rating)
        FROM product_reviews
        WHERE product_id = NEW.product_id AND is_approved = TRUE
    ),
    review_count = (
        SELECT COUNT(*)
        FROM product_reviews
        WHERE product_id = NEW.product_id AND is_approved = TRUE
    )
    WHERE id = NEW.product_id;
END //

DELIMITER ;

-- Sample Data
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_amount, usage_limit, expires_at) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 0, 100, DATE_ADD(NOW(), INTERVAL 1 YEAR)),
('SUMMER20', 'Summer sale discount', 'percentage', 20, 50, 200, DATE_ADD(NOW(), INTERVAL 3 MONTH)),
('FREESHIP', 'Free shipping on orders over $75', 'fixed_amount', 10.00, 75, NULL, DATE_ADD(NOW(), INTERVAL 6 MONTH)),
('FIXED25', '$25 off orders over $100', 'fixed_amount', 25.00, 100, 50, DATE_ADD(NOW(), INTERVAL 2 MONTH));

INSERT INTO email_templates (name, subject, html_content, variables) VALUES
('order_confirmation', 'Order Confirmation', 
 '<h1>Thank you for your order!</h1><p>Order #{{order_id}} has been confirmed.</p>',
 JSON_OBJECT('order_id', 'customer_name', 'order_total', 'items')),
('coupon_code', 'Special Discount Code',
 '<h1>Special offer just for you!</h1><p>Use code {{coupon_code}} for {{discount}} off.</p>',
 JSON_OBJECT('coupon_code', 'discount', 'expiry_date')),
('review_request', 'Review Your Purchase',
 '<h1>How was your experience?</h1><p>Please review {{product_name}}.</p>',
 JSON_OBJECT('product_name', 'review_link', 'customer_name'));

-- Update existing products with sample reviews
INSERT INTO product_reviews (product_id, user_id, order_id, rating, title, review, is_approved) VALUES
(1, 1, 1, 5, 'Excellent Quality!', 'The organic tomatoes were fresh and delicious. Will definitely order again!', TRUE),
(2, 1, 1, 4, 'Good Product', 'Fresh lettuce, very crisp. Good value for money.', TRUE),
(3, 2, 2, 5, 'Amazing!', 'Best carrots I''ve ever had. So sweet and fresh!', TRUE),
(1, 2, 2, 5, 'Consistent Quality', 'These tomatoes are always top quality. Perfect for salads.', TRUE),
(4, 1, 1, 3, 'Okay', 'Potatoes were good but a bit small. Still acceptable quality.', TRUE);
