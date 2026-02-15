# Instrucciones para el Agente — Sección "También te puede gustar"

## Contexto
Seccion en cada producto donde se mostrara otros productos relacionados o que puedan interesar el usuario

## Contexto
Sección estática generada en build time con Astro SSG. Sin JavaScript. El backend devuelve siempre 5 productos. El frontend controla la visibilidad según breakpoint con Tailwind CSS. La sección vive en la página de detalle del producto `[slug].astro`.

---

## Backend

### `product.repository.js`

Agregar función `findRelated(productId, categoryIds, limit)`:

- Busca productos activos que compartan al menos una categoría con el producto actual
- Excluye el producto actual con `WHERE p.id != $1`
- Trae la imagen principal desde `product_images` donde `is_primary = true`, con fallback a `image_url` de `products`
- Trae `id`, `name`, `slug`, `base_price` únicamente, no necesita variantes ni stock
- Ordena por `created_at DESC`
- Límite de 5 resultados
- Si los productos de categorías compartidas son menos de 5, completar con productos nuevos que no estén ya en el resultado y que no sean el producto actual

### `product.service.js`

Agregar función `getRelatedProducts(productId, categoryIds)`:

- Llama a `findRelated` del repositorio
- Recibe los `categoryIds` del producto actual, que ya están disponibles en el contexto de la página de detalle
- Retorna array de máximo 5 productos

### `public.routes.js`

No agregar endpoint nuevo. Los productos relacionados se resuelven en build time dentro de `getStaticPaths()` de Astro, no en una llamada separada del cliente.

---

## Frontend

### `[slug].astro`

Dentro de `getStaticPaths()`, después de obtener el producto por slug, llamar a `getRelatedProducts` pasando el `productId` y los `categoryIds` del producto actual. Los productos relacionados llegan como prop a la página junto con el resto de los datos.

### Componente nuevo `RelatedProducts.astro`

Archivo: `client/src/components/shop/RelatedProducts.astro`

Recibe dos props: `products` (array de máximo 5) y `categoryName` y `categorySlug` para construir el link "Ver todos".

**Estructura HTML de la sección:**

```
<section>
  <div>  ← header de la sección
    <h2>También te puede gustar</h2>
    <a href="/camisetas/[categorySlug]">Ver todos →</a>
  </div>
  <div>  ← grid de productos
    ProductCard × 5
  </div>
</section>
```

**Reglas de visibilidad con Tailwind:**

- El grid usa `grid-cols-3` en mobile y `grid-cols-5` en desktop
- El cuarto producto tiene clase `hidden md:block` — visible desde tablet
- El quinto producto tiene clase `hidden lg:block` — visible solo en desktop
- Todos los productos tienen `loading="lazy"` ya que están below the fold

**Las cards en esta sección son más simples que las del home.** Mostrar solo imagen, nombre truncado a una línea con `truncate` y precio. Sin badge de stock ni descripción.

**El link "Ver todos →"** es un `<a>` real apuntando a `/camisetas/[categorySlug]`. Alineado a la derecha del header de la sección. Visible en todos los breakpoints.

### Ubicación en `[slug].astro`

La sección va después de la descripción del producto y antes del footer:

```
Imágenes + info + tallas
Descripción
─────────────────────────
También te puede gustar    ← nueva sección
Footer
```

---

## Consideración para el agente

Si el producto actual no tiene categorías asignadas, `getRelatedProducts` devuelve los 5 productos más nuevos como fallback. La sección siempre se muestra, nunca queda vacía. Si hay menos de 5 productos en total en la tienda, mostrar los que haya sin error.