# Verificación

## Mis dudas antes de mirar la API
- Funcionalidad 1:¿Qué pasa si la fecha de inicio es posterior a la de fin? ¿Qué pasa si solo relleno una fecha y no las dos? ¿Qué pasa si elijo una fecha fuera del rango disponible?

- Funcionalidad 2:¿Qué pasa si el usuario escribe fuera del rango del 5 al 0?¿Qué pasa si la API lo manda en 0.45 o como 45?

- Funcionalidad 3:¿Qué pasa si un grupo tiene menos de 5 categorías? ¿Qué pasa si la api solo manda el top 5? ¿de donde sale el total del grupo ?

## Afirmaciones verificadas

### GET /api/metrics/facets

| Afirmación | Fuente | Estado |
|---|---|---|
| **No tiene parámetros** query/path | openapi.json — no hay `parameters` en la ruta | ✅ |
| **Respuesta: `operation_types`** — array de strings, valores `"income"` \| `"outcome"` | openapi.json + respuesta real: `["income","outcome"]` | ✅ |
| **Respuesta: `business_types`** — array de strings, valores `"B2B"` \| `"B2C"` | openapi.json + respuesta real: `["B2B","B2C"]` | ✅ |
| **Respuesta: `categories`** — array de strings, valores `"suppliers"` \| `"sales"` \| `"operational"` \| `"administrative"` \| `"others"` | openapi.json + respuesta real: `["administrative","operational","others","sales","suppliers"]` | ✅ |
| **Respuesta: `min_date`** — string, formato `date` (YYYY-MM-DD) | openapi.json + respuesta real: `"2025-10-02"` | ✅ |
| **Respuesta: `max_date`** — string, formato `date` (YYYY-MM-DD) | openapi.json + respuesta real: `"2026-09-28"` | ✅ |
| **5 campos obligatorios** — `operation_types`, `business_types`, `categories`, `min_date`, `max_date` | openapi.json — `"required"` los incluye todos | ✅ |

### GET /api/metrics

| Afirmación | Fuente | Estado |
|---|---|---|
| **Parámetro `start_date`** — query, opcional, string (formato date) o null | openapi.json — `"required": false`, `"anyOf": [{"format": "date"},{"type": "null"}]` | ✅ |
| **Parámetro `end_date`** — query, opcional, string (formato date) o null | openapi.json — `"required": false`, `"anyOf": [{"format": "date"},{"type": "null"}]` | ✅ |
| **Parámetro `category`** — query, opcional, enum `"suppliers"` \| `"sales"` \| `"operational"` \| `"administrative"` \| `"others"` o null | openapi.json — `"required": false` | ✅ |
| **Parámetro `operation_type`** — query, opcional, enum `"income"` \| `"outcome"` o null | openapi.json — `"required": false` | ✅ |
| **Respuesta: `FinancialMovement[]`** — array de objetos con `create_date`, `amount`, `operation_type`, `category`, `business_type` | openapi.json — schema `FinancialMovement`, 5 campos required | ✅ |
| **Petición real con filtros de fecha devuelve datos filtrados** | No probado | ❓ |

### GET /api/metrics/alerts?threshold=0.3

| Afirmación | Fuente | Estado |
|---|---|---|
| **Parámetro `threshold`** — query, opcional, number, mínimo 0, defecto 0.3 | openapi.json — `"minimum": 0, "default": 0.3, "required": false` | ✅ |
| **Parámetro `group_by`** — query, opcional, enum `"day"` \| `"week"` \| `"month"`, defecto `"month"` | openapi.json | ✅ |
| **Parámetro `start_date`** — query, opcional, string (formato date) o null | openapi.json | ✅ |
| **Parámetro `end_date`** — query, opcional, string (formato date) o null | openapi.json | ✅ |
| **Parámetro `business_type`** — query, opcional, enum `"B2B"` \| `"B2C"` o null | openapi.json | ✅ |
| **Respuesta: `MetricsAlert[]`** — array de objetos con 4 campos obligatorios | openapi.json + respuesta real con `threshold=0.3` | ✅ |
| **Campo `period`** — string, obligatorio | openapi.json + respuesta real: `"2025-12"`, `"2026-03"`, etc. | ✅ |
| **Campo `outcome_total`** — number, obligatorio | openapi.json + respuesta real: `103378.98`, `88076.9`, etc. | ✅ |
| **Campo `baseline_average`** — number, obligatorio | openapi.json + respuesta real: `51174.1`, `56456.19`, etc. | ✅ |
| **Campo `increase_ratio`** — number, obligatorio | openapi.json + respuesta real: `1.0201`, `0.5601`, etc. | ✅ |
| **Umbral `0.3` devuelve 4 alertas** | Respuesta real con `threshold=0.3` → 4 items | ✅ |
| **Períodos iniciales sin 3 períodos previos no generan alerta** | No probado. El frontend no necesita tratarlo porque si no hay alerta no aparece en la respuesta, pero la hipótesis no está verificada contra la API real. | ❓ |

### GET /api/metrics/categories/top?operation_type=income&limit=5

| Afirmación | Fuente | Estado |
|---|---|---|
| **Parámetro `operation_type`** — query, opcional, enum `"income"` \| `"outcome"`, defecto `"outcome"` | openapi.json | ✅ |
| **Parámetro `limit`** — query, opcional, integer, mínimo 1, máximo 20, defecto 5 | openapi.json — `"minimum": 1, "maximum": 20, "default": 5` | ✅ |
| **Parámetro `start_date`** — query, opcional, string (formato date) o null | openapi.json | ✅ |
| **Parámetro `end_date`** — query, opcional, string (formato date) o null | openapi.json | ✅ |
| **Parámetro `business_type`** — query, opcional, enum `"B2B"` \| `"B2C"` o null | openapi.json | ✅ |
| **Respuesta: `TopCategoryItem[]`** — array de objetos con 3 campos obligatorios | openapi.json + respuesta real con `operation_type=income&limit=5` | ✅ |
| **Campo `category`** — string, obligatorio, enum `"suppliers"` \| `"sales"` \| `"operational"` \| `"administrative"` \| `"others"` | openapi.json + respuesta real: `"sales"`, `"others"` | ✅ |
| **Campo `operation_type`** — string, obligatorio, enum `"income"` \| `"outcome"` | openapi.json + respuesta real: `"income"` | ✅ |
| **Campo `total_amount`** — number, obligatorio | openapi.json + respuesta real: `1132097.38`, `126049.49` | ✅ |
| **Con `limit=5` y `operation_type=income` devuelve 2 categorías (solo existen 2 con income)** | Respuesta real | ✅ |
| **Con `operation_type=outcome` devuelve 4 categorías** | Respuesta real | ✅ |

## Pedido del PM vs API

| # | Pregunta | Lo que dice el PM | Lo que dice la API | ✅ / ❌ / ❓ | Por qué importa |
|---|---|---|---|---|---|
| 1 | ¿El endpoint `/alerts` acepta parámetros de fecha? | "La tabla también debe respetar el rango de fechas establecido en la Funcionalidad 1" (no cita parámetros en la URL de ejemplo) | `GET /api/metrics/alerts` acepta `start_date` y `end_date` como query params opcionales (string date o null). ✅ Probado: con `start_date=2026-01-01&end_date=2026-06-30` devuelve 2 alertas en lugar de 4. | ✅ | El PM no lo dice explícitamente pero la API ya lo soporta. No hace falta extender el endpoint. |
| 2 | ¿Qué parámetro o campo distingue B2B de B2C? | La vista comparativa usa dos endpoints distintos sin filtro de negocio: `GET /api/metrics/categories/top?operation_type=income&limit=5` (sin `business_type`) | El endpoint `categories/top` acepta `business_type` (enum `"B2B"` \| `"B2C"` o null). ✅ Probado: `business_type=B2B` → sales 557903.97; `business_type=B2C` → sales 574193.41. Además `/api/metrics/facets` devuelve `business_types: ["B2B","B2C"]`. | ✅ | El PM plantea dos peticiones separadas; la API permite filtrar con `business_type` directamente. El contrato encaja. |
| 3 | ¿La API devuelve el total de ingresos del grupo o solo el top 5? | La tabla muestra "porcentaje sobre el total del grupo". Para calcularlo hace falta el total del grupo. | `categories/top` devuelve solo los items del top N (con `total_amount` individual). ❌ No devuelve un campo `grand_total` ni `group_total`. Para income solo hay 2 categorías (sales + others), así que su suma SÍ es el total del grupo, pero no está garantizado para otros casos. | ❌ | Si solo existen 2 categorías de income, sumarlas da el total. Pero si en el futuro hubiera más, el porcentaje se calcularía mal porque faltarían categorías. Habría que decidir si el frontend suma los devueltos (solo funciona si el top N cubre todas las categorías del grupo) o si hace una segunda llamada para obtener el total. |
| 4 | ¿El incremento de una alerta viene como ratio (0.45) o como porcentaje (45)? | La tabla muestra la columna "incremento porcentual". | `MetricsAlert.increase_ratio` es un **ratio** (decimal). ✅ Valores reales: `1.0201` (102.01 %), `0.5601` (56.01 %), `0.3864` (38.64 %). | ✅ | El frontend debe multiplicar `increase_ratio` × 100 y añadir "%" al renderizar la columna. Si se usara el valor crudo parecería un decimal, no un porcentaje. |
| 5 | ¿Qué responde la API si threshold está fuera de 0.01–1.0 (error o ajuste)? | "un ratio entre 0.01 y 1.0, por defecto 0.3". Sin especificar comportamiento fuera de rango. | El esquema OpenAPI dice `"minimum": 0` (no 0.01) y **no tiene maximum**. ✅ threshold ≥ 0 → acepta. threshold < 0 → 422 "Input should be greater than or equal to 0". threshold > 1 → respuesta `[]` vacía, sin error. threshold=0 → devuelve 6 alertas. | ❌ | El PM fija cota inferior 0.01, la API acepta 0. Si el input va entre 0–0.01 funcionará pero podría saturar de alertas. Arriba no hay límite soft, solo se queda vacío. El frontend debería limitar el input a 0.01–1.0 como pide el PM y no fiarse del backend para validar el máximo. |
| 6 | ¿Qué parámetros de fecha acepta el endpoint de métricas existente y cómo se llaman? | "dos inputs de fecha en la parte superior del dashboard — una fecha de inicio y una fecha de fin — que filtren todos los datos" | `GET /api/metrics` acepta `start_date` y `end_date` como query params opcionales (string formato date o null). ✅ Probado: `start_date=2026-01-01&end_date=2026-03-31` devuelve 90 movimientos (dentro del rango). | ✅ | Coinciden nombre (`start_date`, `end_date`) y formato (`YYYY-MM-DD`). El PM pide exactamente lo que la API ya ofrece. |

## Decisiones
| Duda | Decisión | Quién la confirma (yo / el PM) |
|---|---|---|
| D1 — Fecha inicio posterior a fecha fin | Opción A: el frontend detecta `start_date > end_date`, muestra un aviso en pantalla y NO envía la petición. | yo |
| D2 — Solo una fecha rellena | Opción A: solo `start_date` filtra desde esa fecha en adelante; solo `end_date` filtra hasta esa fecha. | yo |
| D3 — Fecha fuera del rango disponible | Opción A: los inputs `date` se limitan con `min=min_date` y `max=max_date` obtenidos de `GET /api/metrics/facets`. El usuario no puede seleccionar fuera. | yo |
| D4 — Grupo con menos de 5 categorías | Opción A: la tabla muestra las categorías que devuelva la API, aunque sean menos de 5. | yo |
| D5 — Total del grupo para porcentajes (Func. 3) | Opción C: se pide `GET /api/metrics/categories/top?operation_type=income&limit=20&business_type=<grupo>` y se suman todos los `total_amount` devueltos para obtener el total del grupo. La tabla muestra solo las 5 primeras categorías con su porcentaje sobre esa suma. | PM — confirmar que "total del grupo" = todos los ingresos del grupo (limit=20 captura todos). |
| D6 — Threshold fuera de 0.01–1.0 | Opción A: el input numérico se limita al rango `0.01`–`1.0`, paso `0.01`, defecto `0.3`. Si el usuario escribe fuera del rango no se envía la petición. | yo |
| D7 — Rango de fechas compartido entre páginas | Opción A: el filtro de fechas es independiente en cada página, pero ambas usan el mismo componente de filtro reutilizable. | yo |
| D8 — Datos por props | `DashboardPage` (dashboard) y `ComparativePage` (B2B vs B2C) hacen las llamadas a la API y pasan los datos por props; los componentes solo pintan. `App.tsx` solo alterna entre páginas según la pestaña activa (D16). | yo |
| D9 — Navegación | Botón/pestaña en el header que cambia entre "Dashboard" y "B2B vs B2C". Sin añadir librerías de rutas. | yo |
| D10 — Cuándo se llama | Al abrir cada página, sin fechas y threshold 0.3. Las fechas recargan todo lo de esa página al cambiar, solo si son válidas. El threshold recarga la tabla al salir del input (onBlur), solo si es válido. | yo |
| D11 — Formato | Reusar `formatCurrency` (USD, sin decimales) y `formatPercent` (1 decimal) de `src/lib/financial-utils.ts`. Fechas tal cual YYYY-MM-DD. Gráficos con Recharts (ya instalado). | yo |
| D12 — Posición | `DateRangePicker` debajo del header y encima de los KPIs; `AlertsTable` a ancho completo debajo de los gráficos. Rango disponible mostrado como "Available data: min_date – max_date". | yo |
| D13 — limit=20 cubre siempre todas las categorías | La API solo admite 5 categorías (enum verificado). D5 sigue pendiente del PM, pero se construye así por defecto. | yo |
| D14 — AlertsTable sin paginación | Muestra todas las filas ordenadas por período, sin paginación. | yo |
| D15 — Uso de facets.categories | `facets.categories` se usa como lista de etiquetas de categorías válidas (validación). Los importes y el desglose B2B/B2C se obtienen de `categories/top`, porque `facets` no dispone de importes ni desglose por línea de negocio. Sustituye a la restricción anterior de D14. | PM |
| D16 — Estructura de páginas | Se crean `DashboardPage` (KPIs, gráficos, `DateRangePicker`, `AlertsTable`) y `ComparativePage` (`ComparativeView`). `App.tsx` solo muestra una página u otra según la pestaña activa. | yo |
| D17 — Idioma y locale | Textos de pantalla en inglés, formato `en-US` con punto decimal, según convenciones del repo (R7). Los mensajes de UI siguen el idioma del código existente. | yo |
| D18 — Disparo del filtro de fechas | No hay botón "Aplicar": `onRangeChange` se dispara automáticamente al cambiar una fecha, solo si el rango es válido. | yo |
| D19 — Threshold inválido en onBlur | Si el threshold es inválido tras onBlur, el valor se queda visible con el aviso inline y la tabla mantiene los últimos datos válidos. El input es de tipo `number`. | yo |
| D20 — Comportamiento de navegación y layout | El periodo del `DashboardHeader` se actualiza para reflejar el rango filtrado. `AlertsTable` a ancho completo debajo del grid de gráficos. Al cambiar de pestaña, las fechas de cada página se reinician. Los `helperText` de los KPIs no cambian. | yo |
| D21 — Tests | Los tests quedan fuera de esta spec; se siguen las reglas de `.agents/rules/testing.md`. | yo |