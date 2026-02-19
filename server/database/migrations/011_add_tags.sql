-- Tabla de tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia producto-tags (muchos a muchos)
CREATE TABLE IF NOT EXISTS product_tags (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, tag_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);

-- Trigger para updated_at de tags
CREATE TRIGGER update_tags_modtime
BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Actualizar función de search_vector para incluir tags
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  category_names TEXT;
  tag_names TEXT;
BEGIN
  -- Obtener nombres de categorías
  SELECT string_agg(c.name, ' ')
  INTO category_names
  FROM categories c
  JOIN product_categories pc ON pc.category_id = c.id
  WHERE pc.product_id = NEW.id;

  -- Obtener nombres de tags
  SELECT string_agg(t.name, ' ')
  INTO tag_names
  FROM tags t
  JOIN product_tags pt ON pt.tag_id = t.id
  WHERE pt.product_id = NEW.id;

  -- Combinar todo en el search_vector
  NEW.search_vector :=
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.search_keywords, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(category_names, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(tag_names, '')), 'B');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que actualiza search_vector cuando cambian los tags
CREATE OR REPLACE FUNCTION update_product_search_on_tag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE products SET updated_at = NOW() WHERE id = OLD.product_id;
    RETURN OLD;
  ELSE
    UPDATE products SET updated_at = NOW() WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_search_on_tag ON product_tags;
CREATE TRIGGER trigger_update_search_on_tag
  AFTER INSERT OR DELETE ON product_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_on_tag_change();

-- Tags iniciales comunes para tienda geek
INSERT INTO tags (name, slug, description) VALUES
('Backend', 'backend', 'Desarrollo backend y servidores'),
('Frontend', 'frontend', 'Desarrollo frontend y UI'),
('Full Stack', 'full-stack', 'Desarrollo fullstack'),
('DevOps', 'devops', 'DevOps e infraestructura'),
('Cloud', 'cloud', 'Computación en la nube'),
('Docker', 'docker', 'Contenedores y Docker'),
('Kubernetes', 'kubernetes', 'Orquestación de contenedores'),
('Git', 'git', 'Control de versiones'),
('Database', 'database', 'Bases de datos'),
('API', 'api', 'APIs y servicios web'),
('Mobile', 'mobile', 'Desarrollo móvil'),
('Desktop', 'desktop', 'Aplicaciones de escritorio'),
('Linux', 'linux', 'Sistema operativo Linux'),
('Open Source', 'open-source', 'Software libre'),
('Principiante', 'principiante', 'Para desarrolladores principiantes'),
('Avanzado', 'avanzado', 'Para desarrolladores avanzados'),
('Humor', 'humor', 'Diseños con humor geek'),
('Minimalista', 'minimalista', 'Diseños minimalistas'),
('Retro', 'retro', 'Diseños retro o vintage'),
('Colorido', 'colorido', 'Diseños con muchos colores')
ON CONFLICT DO NOTHING;

-- Actualizar search_vector de productos existentes
UPDATE products SET updated_at = NOW();

COMMENT ON TABLE tags IS 'Tags para clasificación granular de productos';
COMMENT ON TABLE product_tags IS 'Relación muchos a muchos entre productos y tags';
