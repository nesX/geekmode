ALTER TABLE orders
ADD COLUMN address_complement TEXT;

COMMENT ON COLUMN orders.address_complement IS 'Información adicional de la dirección: conjunto, torre, apto, barrio, etc.';
