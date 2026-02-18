# Documentación — Pendiente: Optimización SSR vs SSG

## Estado actual
Todas las páginas de la tienda están configuradas con `output: "server"` en Astro, lo que significa que todo el contenido se genera bajo demanda (SSR - Server Side Rendering) en cada request.

**Páginas afectadas:**
- Home (`index.astro`)
- Listado de categorías (`camisetas/index.astro`)
- Página de categoría (`camisetas/[slug].astro`)
- Detalle de producto (`producto/[slug].astro`)

---

## Por qué funciona ahora
En desarrollo no hay diferencia notable. El contenido se actualiza inmediatamente cuando se agrega un producto desde el admin sin necesidad de redeploy.

---

## El problema en producción

**Latencia:** Cada visita a una página ejecuta queries al backend y genera HTML en ese momento, en lugar de servir HTML pregenerado.

**Carga del servidor:** Con tráfico alto, el servidor Node procesa múltiples requests simultáneos generando las mismas páginas repetidamente.

**Sin caché CDN:** Las páginas SSR no se pueden cachear globalmente en un CDN como lo harían páginas estáticas.

---

## Soluciones disponibles (evaluar antes de producción)

### Opción 1 — Dejar SSR (lo actual)
- ✅ Productos aparecen inmediatamente al agregarlos
- ✅ Sin configuración adicional
- ❌ Mayor latencia y carga del servidor
- **Cuándo usarlo:** Si agregas productos frecuentemente (varias veces por semana)

### Opción 2 — ISR (Incremental Static Regeneration)
```javascript
export const prerender = true
export const revalidate = 60 // segundos
```
- ✅ Productos aparecen en ~60 segundos sin redeploy
- ✅ Performance de páginas estáticas
- ❌ Solo funciona en Vercel, Netlify, Cloudflare
- ❌ No funciona en VPS tradicionales
- **Cuándo usarlo:** Si despliegas en estos providers y agregas productos ocasionalmente

### Opción 3 — SSG con webhook de rebuild
- ✅ Máximo performance
- ❌ Productos tardan 1-3 minutos en aparecer (tiempo del build)
- ❌ Builds frecuentes pueden agotar cuota gratuita
- **Cuándo usarlo:** Catálogo estable, pocos productos nuevos por semana

### Opción 4 — Híbrido (SSR en listados, SSG en detalle)
- Listados (home, categorías) en SSR → productos aparecen inmediatamente
- Páginas de detalle en SSG → máxima velocidad
- ❌ Página de detalle del producto nuevo no existe hasta el siguiente deploy
- **Cuándo usarlo:** Cuando el tráfico va principalmente a listados

---

## Acción requerida antes de producción

1. Decidir con qué frecuencia se agregarán productos en operación real
2. Evaluar el provider de hosting (VPS, Vercel, Netlify, Railway, etc.)
3. Implementar la estrategia correspondiente según la tabla anterior
4. Medir la latencia real con herramientas como Lighthouse o GTmetrix
5. Si la latencia es aceptable (<200ms), dejar SSR. Si no, migrar a alguna opción de optimización

---

## Archivo a modificar cuando se decida

`client/astro.config.mjs` — puede requerir cambiar `output` y configurar `adapter`

Páginas individuales — agregar `export const prerender = true` según la estrategia elegida

---

**Estado:** Pendiente de evaluación en producción  
**Prioridad:** Media (no urgente mientras no haya tráfico real)  
**Fecha de revisión sugerida:** Cuando se acerque el lanzamiento o después de los primeros 100 pedidos