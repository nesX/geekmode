-- 1. Limpieza inicial (Solo para desarrollo, cuidado en prod)
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS variants CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. Configuración de zona horaria (Importante para Colombia)
SET TIME ZONE 'America/Bogota';

-- 3. Tabla de Usuarios (Administradores)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'editor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Productos (La info general para SEO)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- Índice B-tree automático aquí
    description TEXT,
    base_price DECIMAL(12, 0) NOT NULL, -- COP no usa centavos, pero DECIMAL es seguro
    image_url VARCHAR(500), -- URL de Cloudinary
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Variantes (Inventario real: Talla/Color)
CREATE TABLE IF NOT EXISTS variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL, -- S, M, L, XL
    color VARCHAR(50) NOT NULL, -- Negro, Blanco, Azul
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    sku VARCHAR(100) UNIQUE, -- Código opcional para gestión interna
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, size, color) -- Evita duplicados de la misma variante
);

-- 6. Tabla de Pedidos (Cabecera)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(20) UNIQUE NOT NULL, -- Ej: 'ORD-5920' para WhatsApp
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL, -- Clave para tu bot de WhatsApp
    customer_address TEXT,
    total_amount DECIMAL(12, 0) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_PAYMENT', -- PENDING_PAYMENT, PAID, SHIPPED, CANCELLED
    payment_method VARCHAR(50) DEFAULT 'WHATSAPP', -- WHATSAPP, WOMPI
    payment_proof_url VARCHAR(500), -- Foto de la transferencia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Items del Pedido (Detalle)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES variants(id) ON DELETE RESTRICT, -- No borrar variante si ya se vendió
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(12, 0) NOT NULL, -- Precio congelado al momento de compra
    product_name_snapshot VARCHAR(255) -- Nombre congelado por si cambia después
);

-- 8. Índices de Rendimiento (Performance Tuning)
-- Buscar productos por slug es la query más común del frontend (SEO)
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Buscar pedidos por teléfono (cuando escribe el cliente al bot)
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);

-- Buscar pedidos pendientes para el panel de admin
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 9. Función para actualizar el 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_modtime ON orders;
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. Datos Semilla (Seed) para pruebas iniciales
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@tienda.com', '$2b$10$tucodigohash...', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, slug, base_price, image_url) 
VALUES ('Camiseta Developer Mode', 'camiseta-developer-mode', 55000, 'https://placehold.co/600x400')
ON CONFLICT DO NOTHING;

-- Asumimos que el ID del producto anterior fue 1
INSERT INTO variants (product_id, size, color, stock)
VALUES 
(1, 'M', 'Negro', 10),
(1, 'L', 'Negro', 15),
(1, 'M', 'Blanco', 5)
ON CONFLICT DO NOTHING;
