# Instrucciones para el Agente — Selectores de Departamento y Municipio

## Contexto
El archivo JSON con los datos de Colombia está en `client/src/data/municipios-colombia.json`. El checkout debe mostrar dos selectores: primero departamento, luego municipio. Al seleccionar un departamento se filtran solo los municipios de ese departamento. Los valores se envían al backend como strings simples.

---

## Frontend — Componente de Checkout

### Importar el JSON

En el archivo del componente de checkout (el que contiene el formulario de datos del cliente):

```javascript
import colombiaData from '../data/municipios-colombia.json'
```

### Estado para los selectores

El componente necesita dos estados adicionales:

- `selectedDepartment` — guarda el ID del departamento seleccionado
- `selectedMunicipality` — guarda el nombre del municipio seleccionado

### Lógica de filtrado

Cuando el usuario selecciona un departamento, filtrar los municipios así:

```javascript
const municipios = selectedDepartment 
  ? colombiaData.departments.find(d => d.id === selectedDepartment)?.municipalities || []
  : []
```

El selector de municipios solo se habilita cuando hay un departamento seleccionado. Si no hay departamento seleccionado, el selector de municipios está deshabilitado y muestra el placeholder "Primero selecciona un departamento".

### Estructura de los selectores

**Select de departamento:**
- Ordenar alfabéticamente por `name` (ya viene ordenado del JSON)
- Placeholder: "Selecciona tu departamento"
- Al cambiar, resetear el municipio seleccionado a vacío

**Select de municipio:**
- Mostrar solo los municipios del departamento seleccionado
- Ordenar alfabéticamente por `name` (ya viene ordenado del JSON)
- Placeholder: "Selecciona tu municipio"
- Deshabilitado si no hay departamento seleccionado

### Lo que se envía al backend

Al hacer submit del formulario, construir los campos así:

```javascript
{
  department: colombiaData.departments.find(d => d.id === selectedDepartment)?.name,
  city: selectedMunicipality
}
```

Es decir, se envían los **nombres** como strings, no los IDs. Esto es importante porque la tabla `orders` guarda texto, no foreign keys.

### Validación del formulario

Antes de permitir submit, validar que:
- `selectedDepartment` no sea null
- `selectedMunicipality` no sea vacío

Mostrar mensaje de error si falta alguno de los dos.

---

## Modificación en `order.repository.js`

La función `create` que ya existe debe recibir `department` y `city` como strings en el objeto `orderData` y guardarlos tal cual en las columnas correspondientes de la tabla `orders`.

---

## Consideración importante

El campo `customer_address` sigue siendo un input de texto libre donde el usuario escribe su dirección completa (calle, número, barrio). Los selectores de departamento y municipio son campos separados adicionales.

El orden visual recomendado en el formulario es:

```
Nombre completo
Teléfono
Email
Dirección (calle, número, barrio)  ← input texto libre
Departamento                       ← select
Municipio                          ← select filtrado
```

---

## Resumen

| Archivo | Acción |
|---|---|
| Componente de checkout | Importar JSON, agregar dos estados, implementar selectores con filtrado |
| `order.repository.js` | Sin cambios (ya recibe department y city como strings) |