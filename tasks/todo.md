# Plan de Implementación — Home con Categorías e Imágenes

El home tenga inicialmente la seccion de nuevos lanzamientos y abajo productos por categoria, se mostrara 8 productos por cada seccion cada seccion tendra el link en la parte superior derecha de ver todos

## Contexto para el agente
El home se genera en build time con Astro SSG. Todas las secciones van en el HTML inicial. El rendimiento se logra con lazy loading de imágenes y prioridad explícita en las primeras visibles, sin JavaScript adicional.

---

## Backend — Endpoint nuevo

En `product.repository.js` agregar una función `findHomeData()` que retorna en una sola query todo lo que necesita el home:

- Los 8 productos más recientes con `is_active = true` ordenados por `created_at DESC`
- Los productos agrupados por categoría, máximo 8 por categoría, solo categorías activas que tengan al menos un producto activo

Para cada producto traer: `id`, `name`, `slug`, `base_price`, `total_stock` sumado desde variants, y la imagen principal desde `product_images` donde `is_primary = true`. Si no tiene imagen en `product_images`, usar `image_url` de `products` como fallback.

En `product.service.js` agregar `getHomeData()` que llama al repositorio y estructura la respuesta así:

```
{
  newest: [ ...8 productos ],
  categories: [
    { id, name, slug, products: [ ...hasta 8 ] },
    { id, name, slug, products: [ ...hasta 8 ] }
  ]
}
```

En `public.routes.js` agregar:

```
GET /api/home
```

---

## Consideración importante sobre la query

Traer productos agrupados por categoría en una sola query SQL es complejo y puede volverse difícil de mantener. El agente debe evaluar dos opciones:

**Opción A — Una query por categoría:** El service llama al repositorio una vez para los nuevos, luego itera sobre las categorías activas y hace una query por cada una. Simple y legible. Con 6 categorías son 7 queries pero todas son rápidas con los índices correctos.

**Opción B — Una sola query con agrupación:** Más eficiente en conexiones pero compleja con `json_agg` anidados. Solo si el agente tiene experiencia con esto.

Recomendación: empezar con Opción A. Si en el futuro hay problemas de rendimiento, migrar a Opción B.

---

## Frontend — `index.astro`

### Estructura de la página

```
Header
Sección "Nuevos"     → grid de 8 ProductCard
Sección "Python"     → grid de 8 ProductCard
Sección "Node"       → grid de 8 ProductCard
...una sección por categoría activa con productos
Footer
```

### Fetch en build time

En el frontmatter de `index.astro` llamar a `GET /api/home` y desestructurar `newest` y `categories`. Todo esto ocurre en build time, el usuario nunca ve este fetch.

### Componente `ProductCard.astro`

Modificar el componente existente para aceptar estos props:

- `name`, `slug`, `base_price`, `image_url`, `total_stock`
- `priority` booleano — cuando es `true` la imagen usa `loading="eager"` y `fetchpriority="high"`, cuando es `false` usa `loading="lazy"`

### Regla de prioridad de imágenes

Las primeras 4 cards de la sección "Nuevos" reciben `priority={true}`. Todas las demás cards en toda la página reciben `priority={false}`. El agente implementa esto pasando el índice del loop al componente.

### Dimensiones fijas en todas las imágenes

Todas las imágenes de `ProductCard` deben tener `width` y `height` definidos explícitamente en el HTML para evitar CLS. Usar dimensiones consistentes en toda la página, por ejemplo `400x400`.

### Fallback de imagen

Si `image_url` llega `null` o vacío, mostrar una imagen placeholder. El agente puede usar la imagen `camiseta-template.png` que ya existe en `public/images/`.

---

## Frontend — Sección de categorías en `Header.astro`

### Dropdown de navegación

Modificar `Header.astro` para agregar un dropdown de categorías. El fetch a `GET /api/categories` ocurre en build time en el frontmatter del layout o del header. El dropdown es HTML puro sin JavaScript, usando CSS para mostrar y ocultar con `:hover`.

Las opciones del dropdown son:

```
/camisetas          → ver todas
/camisetas/python   → Python
/camisetas/node     → Node
...
```

---

## Frontend — Páginas de categoría

### `/camisetas/index.astro`

Página nueva. Muestra todas las categorías activas como grid de cards. Cada card tiene nombre de categoría, descripción y un link a `/camisetas/[slug]`. Fetch a `GET /api/categories` en build time.

### `/camisetas/[slug].astro`

Página nueva con `getStaticPaths()`. Llama a `GET /api/categories` para generar todas las rutas. Por cada categoría hace fetch a `GET /api/categories/:slug/products` para obtener los productos. Misma regla de prioridad de imágenes: las primeras 4 con `priority={true}`, el resto lazy.

El agente debe agregar un comentario en `getStaticPaths()` indicando que si se crea una categoría nueva en el admin se requiere un nuevo build para que aparezca la página.

---

## Resumen de archivos a modificar o crear

| Archivo | Acción |
|---|---|
| `product.repository.js` | Agregar `findHomeData()` y `findByCategory(slug)` |
| `product.service.js` | Agregar `getHomeData()` |
| `public.routes.js` | Agregar `GET /api/home` |
| `client/src/pages/index.astro` | Reemplazar datos estáticos con fetch a `/api/home` |
| `client/src/components/shop/ProductCard.astro` | Agregar prop `priority` para control de lazy loading |
| `client/src/components/ui/Header.astro` | Agregar dropdown de categorías |
| `client/src/pages/camisetas/index.astro` | Página nueva |
| `client/src/pages/camisetas/[slug].astro` | Página nueva con `getStaticPaths()` |