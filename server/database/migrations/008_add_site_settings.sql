CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Valores iniciales
INSERT INTO site_settings (key, value) VALUES
('contact_whatsapp', '+573001234567'),
('contact_email', 'hola@geekmode.co'),
('contact_instagram', '@geekmode'),
('shipping_time', '3 a 5 días hábiles'),
('free_shipping_message', 'Envío gratis en compras superiores a $150.000')
ON CONFLICT DO NOTHING;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_site_settings_modtime
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE site_settings IS 'Configuración general del sitio editable desde el admin';
