

# 🚀 GeekShop Headless E-commerce

> **Contexto del Proyecto:** Tienda online de camisetas de alto rendimiento enfocada en SEO, velocidad de carga (Core Web Vitals) y un flujo de venta híbrido (WhatsApp + Pasarelas locales en Colombia).

## 🛠 Tech Stack & Arquitectura

Este proyecto opera como un **Monorepo** dividido en Cliente y Servidor.

### 🎨 Frontend (`/client`)

* **Framework:** [Astro](https://astro.build/) (Server-Side Rendering & Static Generation).
* **Interactividad:** [React](https://react.dev/) (Usado solo en "Islas": Carrito, Checkout, Admin).
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first).
* **Estado Global:** [Nano Stores](https://github.com/nanostores/nanostores) (Ligero, agnóstico al framework).
* **Admin Panel:** Single Page Application (SPA) construida en React, renderizada dentro de una ruta de Astro (`client:only="react"`).

### ⚙️ Backend (`/server`)

* **Runtime:** Node.js + Express.
* **Patrón de Diseño:** **Arquitectura por Capas** (Layered Architecture):
* `Routes` -> `Controllers` -> `Services` -> `Repositories` (SQL).


* **Base de Datos:** PostgreSQL (Raw SQL).
* **Validación:** [Zod](https://zod.dev/).
* **ORM:** ⛔ **NO USAR ORM**. Se utiliza `pg` (node-postgres) con consultas SQL puras en la capa de repositorios para máximo rendimiento.

---

## 🧠 Lógica de Negocio Clave

### 1. Flujo de Compra (WhatsApp First)

El objetivo es minimizar la fricción y costos de pasarela en la fase inicial.

1. **Carrito:** Usuario agrega productos (Gestionado por Nano Stores).
2. **Checkout:** Usuario llena formulario (Nombre, Teléfono).
3. **Persistencia:** Backend crea la orden en Postgres con estado `PENDING_PAYMENT`.
4. **Redirección:** Backend devuelve un ID de pedido (`#ORD-123`). Frontend construye enlace `wa.me` con mensaje pre-llenado.
5. **Cierre:** Usuario envía mensaje a WhatsApp. Vendedor (Admin) verifica transferencia y marca `PAID`.

### 2. Gestión de Inventario (Variantes)

Los productos no tienen stock directo. El stock vive en la tabla `variants` (Talla/Color).

* *Ejemplo:* Camiseta X -> Talla L / Color Negro -> Stock: 10.

### 3. Imágenes

Las imágenes **no** se guardan en BD. Se suben a **Cloudinary** y la BD guarda solo la URL segura (`https://res.cloudinary...`).

---

## 🗄️ Modelo de Datos (PostgreSQL)

**IMPORTANTE PARA AGENTES:** Usar este esquema como referencia absoluta para generar queries SQL.

```sql
-- Resumen del Schema
TABLE users (id, email, password_hash, role: 'admin');
TABLE products (id, name, slug, base_price, image_url, is_active);
TABLE variants (id, product_id, size, color, stock); -- UNIQUE(product_id, size, color)
TABLE orders (
  id, public_id, -- Ej: 'ORD-5920'
  customer_phone, total_amount, status, payment_method
);
TABLE order_items (
  id, order_id, variant_id, quantity, 
  price_at_purchase -- Snapshot del precio al momento de compra
);

```

---

## 📂 Estructura del Proyecto

```text
/
├── client/                 # Frontend (Astro)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/      # Componentes React del Panel Privado
│   │   │   └── shop/       # Componentes Astro/React de la Tienda
│   │   ├── pages/
│   │   │   ├── admin/      # SPA Catch-all ([...all].astro)
│   │   │   └── api/        # Endpoints server-side de Astro (si aplica)
│   │   └── lib/            # store.js (Carrito), api.js (Fetch wrapper)
│
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── config/         # DB Pool connection
│   │   ├── controllers/    # Manejo de Req/Res
│   │   ├── services/       # Lógica de negocio (Cálculos, llamadas externas)
│   │   ├── repositories/   # ⚠️ SQL QUERIES AQUÍ (Aislamiento de datos)
│   │   ├── routes/         # Definición de endpoints
│   │   └── middlewares/    # Auth (JWT), Uploads (Multer)
│   └── database/           # Scripts SQL (init.sql)

```

---

## 🤖 Reglas para Agentes de IA (Cursor/Copilot)

Si estás generando código para este proyecto, sigue estas directrices estrictamente:

1. **SQL Puro:** Nunca sugieras instalar Prisma o Sequelize. Usa `pool.query` con consultas parametrizadas (`$1, $2`) para prevenir SQL Injection.
2. **Separación de Responsabilidades:**
* Si es lógica de UI -> `client/components`
* Si es lógica de Base de Datos -> `server/src/repositories`
* Si es lógica de negocio compleja -> `server/src/services`


3. **Estilos:** Usa siempre clases de **Tailwind CSS**. No escribas CSS puro a menos que sea estrictamente necesario en `global.css`.
4. **Tipado:** Aunque es JS, usa JSDoc o prop-types si es necesario para clarificar estructuras de datos complejas.
5. **Rendimiento:** Prioriza componentes `.astro` sobre `.jsx` a menos que se requiera `useState` o `useEffect`.

---

## 🚀 Comandos Rápidos

### Desarrollo

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev

```

### Configuración Inicial

1. Crear base de datos PostgreSQL: `mitienda`.
2. Ejecutar script: `psql -d mitienda -f server/database/init.sql`.
3. Configurar `.env` en `/server` con `DB_USER`, `DB_PASS`, `JWT_SECRET`.