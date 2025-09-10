-- Easy Eat AI POS - Supabase Database Schema
-- Run this script in your Supabase SQL Editor

-- Drop and recreate products table to ensure correct schema
DROP TABLE IF EXISTS products CASCADE;

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate sales table
DROP TABLE IF EXISTS sales CASCADE;

-- Sales table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    items JSONB NOT NULL, -- Array of cart items
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate expenses table
DROP TABLE IF EXISTS expenses CASCADE;

-- Expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a POS system)
-- Products policies
CREATE POLICY "Allow public read access on products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on products" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on products" ON products
    FOR UPDATE USING (true);

-- Sales policies
CREATE POLICY "Allow public read access on sales" ON sales
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on sales" ON sales
    FOR INSERT WITH CHECK (true);

-- Expenses policies
CREATE POLICY "Allow public read access on expenses" ON expenses
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on expenses" ON expenses
    FOR INSERT WITH CHECK (true);

-- Insert some sample data
INSERT INTO products (name, category, price, stock, image_url, description) VALUES
('Chicken Burger', 'Burgers', 350, 50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 'Delicious chicken burger with fresh vegetables'),
('Beef Burger', 'Burgers', 400, 30, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', 'Juicy beef burger with cheese'),
('French Fries', 'Sides', 150, 100, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', 'Crispy golden french fries'),
('Chicken Wings', 'Sides', 250, 40, 'https://images.unsplash.com/photo-1567620832904-9fe5cf23db13?w=400', 'Spicy chicken wings'),
('Coca Cola', 'Beverages', 80, 200, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400', 'Refreshing cola drink'),
('Orange Juice', 'Beverages', 120, 60, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', 'Fresh orange juice'),
('Chocolate Cake', 'Desserts', 200, 25, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 'Rich chocolate cake'),
('Ice Cream', 'Desserts', 100, 80, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 'Vanilla ice cream')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON sales(timestamp);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
