-- ============================================================
-- SEED DATA: Categorias y Productos de prueba para GeekShop
-- ============================================================

-- -----------------------------------------------
-- 1. CATEGORIAS
-- -----------------------------------------------
INSERT INTO categories (name, slug, description, is_active) VALUES
  ('Camisetas',   'camisetas',   'Camisetas geek con diseños exclusivos para desarrolladores y gamers', true),
  ('Hoodies',     'hoodies',     'Hoodies y buzos con estilo cyberpunk para los dias frios',           true),
  ('Accesorios',  'accesorios',  'Stickers, mugs, gorras y mas para completar tu setup',               true),
  ('Posters',     'posters',     'Posters de alta calidad para decorar tu espacio de trabajo',         true)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------
-- 2. PRODUCTOS
-- -----------------------------------------------

-- == CAMISETAS (10) ==
INSERT INTO products (name, slug, base_price, description, image_url, is_active) VALUES
  ('Camiseta Hello World',       'camiseta-hello-world',       49900, 'La clasica frase que todo dev conoce. Diseno minimalista sobre tela 100% algodon.', 'https://placehold.co/600x400/1a1a2e/8b5cf6?text=Hello+World', true),
  ('Camiseta Bug Hunter',        'camiseta-bug-hunter',        52000, 'Para los que viven cazando bugs. Estampado con insecto pixelado y codigo binario.', 'https://placehold.co/600x400/1a1a2e/06b6d4?text=Bug+Hunter', true),
  ('Camiseta 404 Not Found',     'camiseta-404-not-found',     49900, 'Error 404: Vida social no encontrada. Perfecta para introvertidos orgullosos.',     'https://placehold.co/600x400/1a1a2e/f43f5e?text=404+Not+Found', true),
  ('Camiseta Git Push Force',    'camiseta-git-push-force',    55000, 'Vive al limite. Diseno con el comando mas peligroso de git en tipografia retro.',   'https://placehold.co/600x400/1a1a2e/eab308?text=Git+Push+Force', true),
  ('Camiseta CSS is Awesome',    'camiseta-css-is-awesome',    49900, 'El meme clasico de CSS con el texto desbordando la caja. Algodon premium.',        'https://placehold.co/600x400/1a1a2e/22c55e?text=CSS+Awesome', true),
  ('Camiseta sudo rm -rf',       'camiseta-sudo-rm-rf',        52000, 'El comando que da escalofrios. Estampado estilo terminal sobre fondo negro.',       'https://placehold.co/600x400/1a1a2e/ef4444?text=sudo+rm+-rf', true),
  ('Camiseta Vim Exit',          'camiseta-vim-exit',          49900, 'Llevo 3 años intentando salir de Vim. Humor geek en su maxima expresion.',         'https://placehold.co/600x400/1a1a2e/a855f7?text=Vim+Exit', true),
  ('Camiseta Localhost',         'camiseta-localhost',         55000, 'There is no place like 127.0.0.1. Diseno cyberpunk con neon morado.',               'https://placehold.co/600x400/1a1a2e/8b5cf6?text=Localhost', true),
  ('Camiseta Binary',            'camiseta-binary',            49900, 'Solo hay 10 tipos de personas: las que entienden binario y las que no.',             'https://placehold.co/600x400/1a1a2e/06b6d4?text=Binary', true),
  ('Camiseta It Works On My PC', 'camiseta-works-on-my-pc',    55000, 'La excusa favorita de todo dev. Estampado con laptop humeante y texto glitch.',     'https://placehold.co/600x400/1a1a2e/f97316?text=Works+On+My+PC', true)
ON CONFLICT (slug) DO NOTHING;

-- == HOODIES (10) ==
INSERT INTO products (name, slug, base_price, description, image_url, is_active) VALUES
  ('Hoodie Cyberpunk Coder',      'hoodie-cyberpunk-coder',      120000, 'Hoodie negro con circuitos neon bordados en las mangas. Forro interior polar.',        'https://placehold.co/600x400/0f0f23/8b5cf6?text=Cyberpunk+Coder', true),
  ('Hoodie Dark Mode',            'hoodie-dark-mode',            115000, 'Porque el modo oscuro es un estilo de vida. Logo minimalista con luna y codigo.',      'https://placehold.co/600x400/0f0f23/f8fafc?text=Dark+Mode', true),
  ('Hoodie Stack Overflow',       'hoodie-stack-overflow',       125000, 'Copiado de Stack Overflow con orgullo. Diseno con el logo icono de la comunidad.',     'https://placehold.co/600x400/0f0f23/f48024?text=Stack+Overflow', true),
  ('Hoodie Hackerman',            'hoodie-hackerman',            130000, 'Estilo matrix con lluvia de caracteres verdes. Para sentirte Neo en cada deploy.',     'https://placehold.co/600x400/0f0f23/22c55e?text=Hackerman', true),
  ('Hoodie Open Source',          'hoodie-open-source',          115000, 'Apoya el codigo libre. Diseno con el logo de open source y ramas de git.',             'https://placehold.co/600x400/0f0f23/06b6d4?text=Open+Source', true),
  ('Hoodie Kernel Panic',         'hoodie-kernel-panic',         120000, 'Cuando el sistema colapsa pero tu sigues adelante. Texto glitch sobre negro.',         'https://placehold.co/600x400/0f0f23/ef4444?text=Kernel+Panic', true),
  ('Hoodie AI Overlord',          'hoodie-ai-overlord',          135000, 'Bienvenidos a la era de la IA. Diseno futurista con cerebro digital y circuitos.',     'https://placehold.co/600x400/0f0f23/a855f7?text=AI+Overlord', true),
  ('Hoodie Merge Conflict',       'hoodie-merge-conflict',       120000, 'El terror de todo equipo. Diseno con flechas en conflicto y codigo superpuesto.',      'https://placehold.co/600x400/0f0f23/eab308?text=Merge+Conflict', true),
  ('Hoodie Full Stack',           'hoodie-full-stack',           125000, 'Frontend, backend y todo lo que hay en medio. Capas de tecnologia en el pecho.',       'https://placehold.co/600x400/0f0f23/8b5cf6?text=Full+Stack', true),
  ('Hoodie NaN Problemas',        'hoodie-nan-problemas',        115000, 'Tengo NaN problemas y JavaScript es todos. Humor dev en cada centimetro.',             'https://placehold.co/600x400/0f0f23/f43f5e?text=NaN+Problemas', true)
ON CONFLICT (slug) DO NOTHING;

-- == ACCESORIOS (10) ==
INSERT INTO products (name, slug, base_price, description, image_url, is_active) VALUES
  ('Mug Semicolon',              'mug-semicolon',              35000, 'Taza con punto y coma gigante. Porque un ; faltante puede arruinar tu dia.',          'https://placehold.co/600x400/1a1a2e/f8fafc?text=Mug+Semicolon', true),
  ('Sticker Pack Dev',           'sticker-pack-dev',           18000, 'Pack de 15 stickers con memes de programacion para tu laptop y botellas.',             'https://placehold.co/600x400/1a1a2e/22c55e?text=Sticker+Pack', true),
  ('Gorra Sudo',                 'gorra-sudo',                 42000, 'Gorra snapback con bordado "sudo" al frente. Ejecuta comandos con estilo.',            'https://placehold.co/600x400/1a1a2e/8b5cf6?text=Gorra+Sudo', true),
  ('Mousepad XXL Terminal',      'mousepad-xxl-terminal',      55000, 'Mousepad de escritorio completo con diseno de terminal. 80x30cm antideslizante.',      'https://placehold.co/600x400/1a1a2e/06b6d4?text=Mousepad+Terminal', true),
  ('Pin Metalico Curly Braces',  'pin-metalico-curly-braces',  12000, 'Pin esmaltado con llaves { } en acabado dorado. Ideal para mochilas y chaquetas.',     'https://placehold.co/600x400/1a1a2e/eab308?text=Pin+Braces', true),
  ('Botella Debugger',           'botella-debugger',           38000, 'Botella termica 500ml con diseno de breakpoints. Mantiene tu cafe caliente 12h.',       'https://placehold.co/600x400/1a1a2e/ef4444?text=Botella+Debugger', true),
  ('Llavero USB Retro',          'llavero-usb-retro',          15000, 'Llavero en forma de USB tipo A. Nostalgia pura en metal cromado.',                     'https://placehold.co/600x400/1a1a2e/a855f7?text=Llavero+USB', true),
  ('Mug Infinite Loop',          'mug-infinite-loop',          35000, 'Taza con while(true) { coffee++ }. El loop que todos queremos.',                       'https://placehold.co/600x400/1a1a2e/f97316?text=Infinite+Loop', true),
  ('Gorra Binary',               'gorra-binary',               42000, 'Gorra trucker con patron binario sublimado. El accesorio definitivo del geek.',        'https://placehold.co/600x400/1a1a2e/22c55e?text=Gorra+Binary', true),
  ('Calcetines HTTP Status',     'calcetines-http-status',     22000, 'Pack de 3 pares: 200 OK (verde), 404 (rojo), 500 (naranja). Algodon premium.',         'https://placehold.co/600x400/1a1a2e/f43f5e?text=Calcetines+HTTP', true)
ON CONFLICT (slug) DO NOTHING;

-- == POSTERS (10) ==
INSERT INTO products (name, slug, base_price, description, image_url, is_active) VALUES
  ('Poster Algoritmos',           'poster-algoritmos',           28000, 'Poster A2 con visualizacion artistica de algoritmos de ordenamiento. Full color.',     'https://placehold.co/600x400/0f0f23/8b5cf6?text=Algoritmos', true),
  ('Poster Atajos Vim',           'poster-atajos-vim',           25000, 'Cheat sheet de Vim en formato poster A3. Referencia rapida para tu escritorio.',       'https://placehold.co/600x400/0f0f23/22c55e?text=Vim+Cheatsheet', true),
  ('Poster Git Flow',             'poster-git-flow',             25000, 'Diagrama de git flow en estilo blueprint. Entiende las ramas de un vistazo.',          'https://placehold.co/600x400/0f0f23/06b6d4?text=Git+Flow', true),
  ('Poster Clean Code',           'poster-clean-code',           28000, 'Los principios de codigo limpio en tipografia moderna. Inspiracion diaria.',           'https://placehold.co/600x400/0f0f23/f8fafc?text=Clean+Code', true),
  ('Poster Shortcuts VS Code',    'poster-shortcuts-vscode',     25000, 'Los atajos mas utiles de VS Code en un poster A3 elegante. Productividad x10.',        'https://placehold.co/600x400/0f0f23/007acc?text=VS+Code', true),
  ('Poster Big-O Notation',       'poster-big-o-notation',       28000, 'Complejidad algoritmica explicada visualmente. Graficas comparativas en neon.',        'https://placehold.co/600x400/0f0f23/eab308?text=Big-O', true),
  ('Poster Linux Commands',       'poster-linux-commands',       25000, 'Los 50 comandos esenciales de Linux. Poster de referencia para tu home office.',       'https://placehold.co/600x400/0f0f23/f97316?text=Linux+Commands', true),
  ('Poster Design Patterns',      'poster-design-patterns',      30000, 'Los 23 patrones de diseno del Gang of Four en ilustraciones minimalistas.',            'https://placehold.co/600x400/0f0f23/a855f7?text=Design+Patterns', true),
  ('Poster HTTP Status Codes',    'poster-http-status',          25000, 'Todos los codigos HTTP con descripciones y emojis. Divertido y educativo.',            'https://placehold.co/600x400/0f0f23/ef4444?text=HTTP+Status', true),
  ('Poster SQL Joins',            'poster-sql-joins',            25000, 'Diagramas de Venn de todos los tipos de JOIN. La referencia visual definitiva.',       'https://placehold.co/600x400/0f0f23/06b6d4?text=SQL+Joins', true)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------
-- 3. VARIANTES (tallas/colores con stock)
-- -----------------------------------------------

-- Helper: insertar variantes para camisetas (S, M, L, XL en Negro y Blanco)
DO $$
DECLARE
  prod RECORD;
  s TEXT;
  c TEXT;
  sizes TEXT[] := ARRAY['S','M','L','XL'];
  colors TEXT[] := ARRAY['Negro','Blanco'];
BEGIN
  FOR prod IN
    SELECT id FROM products WHERE slug LIKE 'camiseta-%' AND slug != 'camiseta-developer-mode'
  LOOP
    FOREACH s IN ARRAY sizes LOOP
      FOREACH c IN ARRAY colors LOOP
        INSERT INTO variants (product_id, size, color, stock, sku)
        VALUES (prod.id, s, c, floor(random()*30 + 5)::int, NULL)
        ON CONFLICT (product_id, size, color) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Variantes para hoodies (M, L, XL en Negro y Gris)
DO $$
DECLARE
  prod RECORD;
  s TEXT;
  c TEXT;
  sizes TEXT[] := ARRAY['M','L','XL'];
  colors TEXT[] := ARRAY['Negro','Gris'];
BEGIN
  FOR prod IN
    SELECT id FROM products WHERE slug LIKE 'hoodie-%'
  LOOP
    FOREACH s IN ARRAY sizes LOOP
      FOREACH c IN ARRAY colors LOOP
        INSERT INTO variants (product_id, size, color, stock, sku)
        VALUES (prod.id, s, c, floor(random()*20 + 3)::int, NULL)
        ON CONFLICT (product_id, size, color) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Variantes para accesorios (unica talla, unico color)
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN
    SELECT id FROM products WHERE slug IN (
      'mug-semicolon','sticker-pack-dev','mousepad-xxl-terminal',
      'pin-metalico-curly-braces','botella-debugger','llavero-usb-retro',
      'mug-infinite-loop','calcetines-http-status'
    )
  LOOP
    INSERT INTO variants (product_id, size, color, stock, sku)
    VALUES (prod.id, 'Unica', 'Default', floor(random()*50 + 10)::int, NULL)
    ON CONFLICT (product_id, size, color) DO NOTHING;
  END LOOP;

  -- Gorras con tallas
  FOR prod IN
    SELECT id FROM products WHERE slug IN ('gorra-sudo','gorra-binary')
  LOOP
    INSERT INTO variants (product_id, size, color, stock, sku)
    VALUES
      (prod.id, 'M', 'Negro', floor(random()*20 + 5)::int, NULL),
      (prod.id, 'L', 'Negro', floor(random()*20 + 5)::int, NULL)
    ON CONFLICT (product_id, size, color) DO NOTHING;
  END LOOP;
END $$;

-- Variantes para posters (unica talla, unico color)
DO $$
DECLARE
  prod RECORD;
BEGIN
  FOR prod IN
    SELECT id FROM products WHERE slug LIKE 'poster-%'
  LOOP
    INSERT INTO variants (product_id, size, color, stock, sku)
    VALUES (prod.id, 'A3', 'Default', floor(random()*40 + 10)::int, NULL)
    ON CONFLICT (product_id, size, color) DO NOTHING;
  END LOOP;
END $$;

-- -----------------------------------------------
-- 4. ASOCIAR PRODUCTOS A CATEGORIAS
-- -----------------------------------------------
DO $$
DECLARE
  cat_id INTEGER;
  prod RECORD;
BEGIN
  -- Camisetas
  SELECT id INTO cat_id FROM categories WHERE slug = 'camisetas';
  IF cat_id IS NOT NULL THEN
    FOR prod IN SELECT id FROM products WHERE slug LIKE 'camiseta-%' LOOP
      INSERT INTO product_categories (product_id, category_id) VALUES (prod.id, cat_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Hoodies
  SELECT id INTO cat_id FROM categories WHERE slug = 'hoodies';
  IF cat_id IS NOT NULL THEN
    FOR prod IN SELECT id FROM products WHERE slug LIKE 'hoodie-%' LOOP
      INSERT INTO product_categories (product_id, category_id) VALUES (prod.id, cat_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Accesorios
  SELECT id INTO cat_id FROM categories WHERE slug = 'accesorios';
  IF cat_id IS NOT NULL THEN
    FOR prod IN SELECT id FROM products WHERE slug IN (
      'mug-semicolon','sticker-pack-dev','gorra-sudo','mousepad-xxl-terminal',
      'pin-metalico-curly-braces','botella-debugger','llavero-usb-retro',
      'mug-infinite-loop','gorra-binary','calcetines-http-status'
    ) LOOP
      INSERT INTO product_categories (product_id, category_id) VALUES (prod.id, cat_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Posters
  SELECT id INTO cat_id FROM categories WHERE slug = 'posters';
  IF cat_id IS NOT NULL THEN
    FOR prod IN SELECT id FROM products WHERE slug LIKE 'poster-%' LOOP
      INSERT INTO product_categories (product_id, category_id) VALUES (prod.id, cat_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;
