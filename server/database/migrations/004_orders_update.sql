-- 004_orders_update.sql
-- Adds checkout/payment fields to orders and creates order_status_history

-- New columns on orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS department VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12, 0) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_session_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS magic_token VARCHAR(64),
  ADD COLUMN IF NOT EXISTS magic_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_magic_token ON orders(magic_token);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
