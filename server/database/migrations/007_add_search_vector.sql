-- Agregar columna para palabras clave del admin
ALTER TABLE products
ADD COLUMN search_keywords TEXT DEFAULT '';

-- Agregar columna tsvector para búsqueda
ALTER TABLE products
ADD COLUMN search_vector tsvector;

-- Crear índice GIN para búsqueda eficiente
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);

-- Función para actualizar automáticamente el search_vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  category_names TEXT;
BEGIN
  -- Obtener nombres de categorías asociadas
  SELECT string_agg(c.name, ' ')
  INTO category_names
  FROM categories c
  JOIN product_categories pc ON pc.category_id = c.id
  WHERE pc.product_id = NEW.id;

  -- Combinar nombre + descripción + keywords + categorías en el tsvector
  NEW.search_vector :=
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.search_keywords, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(category_names, '')), 'B');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta al insertar o actualizar producto
DROP TRIGGER IF EXISTS trigger_update_search_vector ON products;
CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE OF name, description, search_keywords
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- Trigger adicional cuando cambian las categorías
CREATE OR REPLACE FUNCTION update_product_search_on_category_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET updated_at = NOW() WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_search_on_category ON product_categories;
CREATE TRIGGER trigger_update_search_on_category
  AFTER INSERT OR DELETE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_on_category_change();

-- Poblar search_vector de productos existentes
UPDATE products SET updated_at = NOW();

-- Comentario
COMMENT ON COLUMN products.search_keywords IS 'Palabras clave para búsqueda separadas por espacios, no visibles para el usuario';

-- Actualizacion manual de los ya existentes
UPDATE products p
SET search_vector = (
  setweight(to_tsvector('spanish', COALESCE(p.name, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(p.description, '')), 'B') ||
  setweight(to_tsvector('spanish', COALESCE(p.search_keywords, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(
    (SELECT string_agg(c.name, ' ')
     FROM categories c
     JOIN product_categories pc ON pc.category_id = c.id
     WHERE pc.product_id = p.id),
    ''
  )), 'B')
);