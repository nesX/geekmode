

# Instrucciones para el Agente — Sistema de Configuración y Contacto

## Contexto
Sistema centralizado de configuración del sitio que permite gestionar desde el admin datos como WhatsApp, email e Instagram. Estos datos se muestran en el footer, página de contacto y en puntos estratégicos del flujo de compra.

---

## Migración SQL

Crear archivo `server/database/migrations/008_add_site_settings.sql`:

```sql
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
```

El usuario ejecutará esta migración manualmente.

---

## Backend

### `repositories/settings.repository.js`

Archivo nuevo con cuatro funciones:

**`findAll()`** — Retorna todas las configuraciones como array de `{ key, value }`

**`findByKey(key)`** — Retorna el `value` de una configuración específica o `null` si no existe

**`update(key, value)`** — Actualiza el valor de una configuración existente. Si la key no existe, lanza error `SETTING_NOT_FOUND`

**`createIfNotExists(key, value)`** — Inserta una nueva configuración solo si no existe. Útil para agregar configuraciones nuevas sin migración

### `services/settings.service.js`

Archivo nuevo:

**`getAllSettings()`** — Llama al repositorio y retorna todas las configuraciones

**`getPublicSettings()`** — Retorna solo las configuraciones públicas que el frontend necesita:
- `contact_whatsapp`
- `contact_email`
- `contact_instagram`
- `shipping_time`
- `free_shipping_message`

Filtra cualquier configuración interna que no deba exponerse públicamente.

**`updateSetting(key, value)`** — Valida el formato antes de actualizar:
- Si `key` contiene `whatsapp`, validar formato de teléfono internacional (debe empezar con `+` y tener 10-15 dígitos)
- Si `key` contiene `email`, validar formato de email
- Si `key` contiene `instagram`, normalizar agregando `@` al inicio si no lo tiene

Lanza `INVALID_FORMAT` si la validación falla.

### `controllers/settings.controller.js`

Archivo nuevo con dos handlers:

**`getPublicSettings`** — Sin autenticación, endpoint público. Retorna el resultado de `getPublicSettings()` del service

**`updateSetting`** — Protegido con `requireAdmin`. Valida con Zod que `key` y `value` sean strings no vacíos. Llama al service

### Validación Zod

```
UpdateSettingSchema:
  key: string min 1 max 100
  value: string min 1
```

### Rutas

En `public.routes.js` agregar:

```
GET /api/settings
```

En `admin.routes.js` agregar:

```
PATCH /api/admin/settings/:key
```

---

## Frontend — Tienda

### Helper `buildWhatsAppLink.js`

Crear `client/src/utils/buildWhatsAppLink.js`:

```javascript
// Recibe el número en formato internacional y un contexto
// Retorna URL completa de WhatsApp con mensaje pre-llenado
export function buildWhatsAppLink(phone, context, data = {}) {
  // Limpiar el número: quitar espacios, guiones, paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  let message = ''
  
  switch(context) {
    case 'checkout':
      message = 'Hola, tengo problemas para completar mi pedido'
      break
    case 'order':
      message = `Hola, mi pedido es ${data.orderId || ''}`
      break
    case 'product':
      message = `Hola, tengo dudas sobre ${data.productName || 'un producto'}`
      break
    case 'general':
    default:
      message = 'Hola, tengo una consulta'
  }
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
```

### Página `/contacto`

Crear `client/src/pages/contacto.astro`.

En el frontmatter hacer fetch a `GET /api/settings` para obtener las configuraciones. Usar `export const prerender = true` ya que estas configuraciones cambian muy raramente.

**Estructura de la página:**

Título principal: "Contáctanos"

Tres cards o secciones:

**1. WhatsApp**
- Ícono de WhatsApp
- Texto: "Escríbenos por WhatsApp"
- Número visible en formato legible: `300 123 4567`
- Botón verde grande "Abrir WhatsApp" que usa `buildWhatsAppLink(phone, 'general')`

**2. Email**
- Ícono de email
- Texto: "Envíanos un correo"
- Email como link `mailto:`

**3. Instagram**
- Ícono de Instagram
- Texto: "Síguenos en Instagram"
- Handle como link a `https://instagram.com/{handle_sin_arroba}`

Al final de la página, una sección opcional con información adicional:
- Tiempo de envío (desde settings `shipping_time`)
- Mensaje de envío gratis (desde settings `free_shipping_message`)

### Footer

Modificar `client/src/components/ui/Footer.astro` para incluir una sección de contacto.

En el frontmatter hacer fetch a `GET /api/settings`.

Agregar una columna en el footer con:
- Link a `/contacto` como texto "Contacto"
- Link de WhatsApp con ícono
- Link de Instagram con ícono (si existe)

### Checkout

Modificar la página `checkout.astro` para mostrar debajo del formulario (antes del botón de pagar):

Texto pequeño en gris: "¿Problemas para completar tu compra? [Escríbenos por WhatsApp]"

El link usa `buildWhatsAppLink(settings.contact_whatsapp, 'checkout')`. Obtener `settings` desde `GET /api/settings` en el frontmatter.

### Página de confirmación del pedido

Modificar `pedido/confirmacion.astro` para incluir al final:

Texto: "¿Tienes dudas sobre tu pedido? [Contáctanos por WhatsApp]"

El link usa `buildWhatsAppLink(settings.contact_whatsapp, 'order', { orderId: publicId })` donde `publicId` es el número de pedido del query param.

---

## Frontend — Admin

### Vista de configuración

Crear `client/src/components/admin/SettingsView.jsx`.

Al montar el componente hacer fetch a `GET /api/admin/settings` (usar el endpoint público ya que el admin puede ver lo mismo, no se necesita endpoint separado).

**Estructura de la vista:**

Formulario con los siguientes campos editables:

- WhatsApp (input text con placeholder `+57 300 123 4567`)
- Email (input email)
- Instagram (input text con placeholder `@geekmode`)
- Tiempo de envío (input text, ejemplo `3 a 5 días hábiles`)
- Mensaje de envío gratis (textarea)

Cada campo tiene un botón "Guardar" individual que llama a `PATCH /api/admin/settings/:key` con el nuevo valor. Esto permite actualizar un campo a la vez sin afectar los demás.

Mostrar mensaje de éxito o error después de cada actualización.

Validación en cliente:
- WhatsApp debe empezar con `+`
- Email debe ser válido
- Instagram puede llevar o no `@` al inicio

### Agregar al `AdminDashboard.jsx`

Agregar "Configuración" a la navegación del dashboard. Al seleccionarla renderiza `SettingsView.jsx`.

---

## Consideraciones para el agente

**La tabla `site_settings` es extensible.** En el futuro se pueden agregar nuevas configuraciones sin migración usando `INSERT ... ON CONFLICT DO NOTHING`.

**El formato del teléfono de WhatsApp es internacional.** Siempre guardarlo con el prefijo `+57` para que el link `wa.me` funcione correctamente desde cualquier país.

**El helper `buildWhatsAppLink` debe sanitizar el teléfono.** Los usuarios pueden escribir el número con espacios o guiones, hay que limpiarlos antes de construir la URL.

**Las páginas que usan settings con `prerender = true`** necesitan un nuevo build para reflejar cambios. Si el admin actualiza el WhatsApp, las páginas estáticas seguirán mostrando el número viejo hasta el siguiente deploy. Documentar esto como limitación o considerar SSR para la página de contacto.

**Instagram es opcional.** Si el campo está vacío no mostrar esa sección en la página de contacto ni en el footer.

---

## Resumen de archivos

| Archivo | Acción |
|---|---|
| `server/database/migrations/008_add_site_settings.sql` | Crear migración |
| `repositories/settings.repository.js` | Nuevo |
| `services/settings.service.js` | Nuevo |
| `controllers/settings.controller.js` | Nuevo |
| `public.routes.js` | Agregar `GET /api/settings` |
| `admin.routes.js` | Agregar `PATCH /api/admin/settings/:key` |
| `client/src/utils/buildWhatsAppLink.js` | Nuevo |
| `client/src/pages/contacto.astro` | Nuevo |
| `client/src/components/ui/Footer.astro` | Modificar |
| `client/src/pages/checkout.astro` | Modificar |
| `client/src/pages/pedido/confirmacion.astro` | Modificar |
| `client/src/components/admin/SettingsView.jsx` | Nuevo |
| `client/src/components/admin/AdminDashboard.jsx` | Agregar vista Configuración |