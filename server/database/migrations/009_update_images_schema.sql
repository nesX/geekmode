-- Cambiar product_images para guardar filename en lugar de url
ALTER TABLE product_images
ADD COLUMN filename VARCHAR(255);

-- Migrar datos existentes si los hay
UPDATE product_images
SET filename = regexp_replace(url, '^.*/([^/]+)$', '\1')
WHERE url IS NOT NULL;

-- Hacer filename obligatorio
ALTER TABLE product_images
ALTER COLUMN filename SET NOT NULL;

-- Borrar columna url
ALTER TABLE product_images
DROP COLUMN url;

-- Lo mismo para products (fallback legacy)
ALTER TABLE products
ADD COLUMN image_filename VARCHAR(255);

UPDATE products
SET image_filename = regexp_replace(image_url, '^.*/([^/]+)$', '\1')
WHERE image_url IS NOT NULL;

ALTER TABLE products
DROP COLUMN image_url;

COMMENT ON COLUMN product_images.filename IS 'Nombre base del archivo sin extensión ni variante (ej: product-1234567890)';
COMMENT ON COLUMN products.image_filename IS 'Nombre base del archivo de imagen legacy';
