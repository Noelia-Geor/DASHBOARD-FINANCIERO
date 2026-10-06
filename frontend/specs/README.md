# Frontend — Guía de integración

> Punto de entrada para el agente. Documentación verificada contra OpenAPI.
> Todos los endpoints, tipos y decisiones están contrastados con respuestas reales.

---

## Funcionalidad 1 — Filtro de rango de fechas

**Requisito PM:** [`pm-brief.md`](./pm-brief.md) — Funcionalidad 1

### Endpoints

| Ruta | Método | Propósito |
|---|---|---|
| `GET /api/metrics/facets` | GET | Obtener metadatos del dataset: rango de fechas disponible, tipos de operación, líneas de negocio y categorías |
| `GET /api/metrics` | GET | Obtener movimientos financieros filtrados por rango de fechas (y otros parámetros opcionales) |

### Tipos

| Archivo | Tipo | Propósito |
|---|---|---|
| [`api-types.ts`](./api-types.ts) → `FacetsResponse` | Respuesta | Contiene `min_date`, `max_date`, más `operation_types`, `business_types`, `categories` |
| [`param-types.ts`](./param-types.ts) → `DateRangeFilter` | Parámetros | `start_date?: string`, `end_date?: string` (YYYY-MM-DD, ambos opcionales) |
| [`param-types.ts`](./param-types.ts) → `MetricsParams` | Parámetros | Extiende `DateRangeFilter`; añade `category` y `operation_type` |

### Parámetros de `GET /api/metrics/facets`

Ninguno. El endpoint no acepta parámetros query ni path.

### Parámetros de `GET /api/metrics`

| Parámetro | Tipo | Obligatorio | Valores válidos | Defecto |
|---|---|---|---|---|
| `start_date` | `string` (date) o `null` | No | Cualquier fecha en formato `YYYY-MM-DD` | `null` (sin filtro) |
| `end_date` | `string` (date) o `null` | No | Cualquier fecha en formato `YYYY-MM-DD` | `null` (sin filtro) |
| `category` | `string` o `null` | No | `suppliers` · `sales` · `operational` · `administrative` · `others` | `null` |
| `operation_type` | `string` o `null` | No | `income` · `outcome` | `null` |

### Casos límite

| # | Caso | Comportamiento esperado en UI |
|---|---|---|
| 1 | **Solo una fecha rellena** — el usuario introduce `start_date` pero no `end_date` (o viceversa) | **Decisión D2.** Si solo está `start_date`, se filtra desde esa fecha en adelante (sin límite superior). Si solo está `end_date`, se filtra hasta esa fecha (sin límite inferior). No se muestra ningún error. El rango disponible se muestra siempre como referencia |
| 2 | **`start_date` posterior a `end_date`** | **Decisión D1.** El componente `DateRangePicker` detecta la incoherencia, muestra el aviso en línea «Start date cannot be after end date» y **no** envía la petición. El filtro se dispara automáticamente al cambiar las fechas (D18), solo si el rango es válido |
| 3 | **Fecha fuera del rango disponible** — el usuario intenta seleccionar una fecha anterior a `min_date` o posterior a `max_date` | **Decisión D3.** Los inputs HTML se limitan con los atributos `min` y `max` obtenidos de `FacetsResponse`. El navegador impide seleccionar fechas fuera. Si por algún motivo (datos desactualizados) ocurre, se trata como dato inválido y no se envía la petición |
| 4 | **`GET /api/metrics/facets` falla** | El componente muestra «Could not load the available date range». Los inputs funcionan sin restricción de `min`/`max`, permitiendo cualquier fecha |

### Componente asociado

Ver [`components.md`](./components.md) — `DateRangePicker` (sección Funcionalidad 1).

### Notas de implementación

- **Posición (D12):** `DateRangePicker` se sitúa debajo del header y encima de los KPIs. El rango disponible se muestra como «Available data: YYYY-MM-DD – YYYY-MM-DD».
- **Formato (D11):** Fechas en YYYY-MM-DD. Los gráficos del dashboard van con Recharts.
- **Carga (D10):** Al abrir la página se cargan los datos sin fechas. Al cambiar las fechas se recarga todo, solo si son válidas. Al cambiar de pestaña, las fechas se reinician (D20).
- **Datos (D8/D16):** `DashboardPage` obtiene los datos de la API y los pasa por props; `App.tsx` solo alterna entre páginas según la pestaña activa.

---

## Funcionalidad 2 — Tabla de alertas de anomalías

**Requisito PM:** [`pm-brief.md`](./pm-brief.md) — Funcionalidad 2

### Endpoint

| Ruta | Método | Propósito |
|---|---|---|
| `GET /api/metrics/alerts?threshold=<ratio>` | GET | Devuelve los períodos donde el outcome superó la media histórica (baseline) según un umbral de sensibilidad |

### Tipos

| Archivo | Tipo | Propósito |
|---|---|---|
| [`api-types.ts`](./api-types.ts) → `AlertEntry` | Respuesta (item) | `period: string`, `outcome_total: number`, `baseline_average: number`, `increase_ratio: number` |
| [`api-types.ts`](./api-types.ts) → `AlertsResponse` | Respuesta (array) | `AlertEntry[]` |
| [`param-types.ts`](./param-types.ts) → `AlertsParams` | Parámetros | Extiende `DateRangeFilter`; añade `threshold`, `group_by`, `business_type` |

### Parámetros de `GET /api/metrics/alerts`

| Parámetro | Tipo | Obligatorio | Valores válidos | Defecto | Restricciones frontend |
|---|---|---|---|---|---|
| `threshold` | `number` | No | `0.01` – `1.0` (frontend); API acepta ≥ `0` | `0.3` | **D6.** Input limitado a 0.01–1.0, paso 0.01. Fuera de ese rango no se envía la petición |
| `group_by` | `string` | No | `day` · `week` · `month` | `month` | — |
| `start_date` | `string` (date) o `null` | No | YYYY-MM-DD | `null` | Heredado de `DateRangeFilter` |
| `end_date` | `string` (date) o `null` | No | YYYY-MM-DD | `null` | Heredado de `DateRangeFilter` |
| `business_type` | `string` o `null` | No | `B2B` · `B2C` | `null` (todas) | — |

### Columnas de respuesta (`AlertEntry`)

| Columna | Campo | Tipo | Notas de visualización |
|---|---|---|---|
| Period | `period` | `string` | Formato `YYYY-MM` (con `group_by=month`). Se muestra tal cual |
| Recorded outcome | `outcome_total` | `number` | `formatCurrency` (USD, sin decimales). **D11** |
| Moving average (3 periods) | `baseline_average` | `number` | `formatCurrency` (USD, sin decimales). **D11** |
| Increase percentage | `increase_ratio` | `number` | **D4 del PM.** `increase_ratio × 100` con `formatPercent` (1 decimal + «%»). Ej: `1.0201` → «102.0%». **D11** |

### Casos límite

| # | Caso | Comportamiento esperado en UI |
|---|---|---|
| 1 | **Threshold fuera de 0.01–1.0** — el usuario introduce 0, 0.005, 1.5 o un valor negativo | **Decisión D6/D19.** El input se limita a `0.01`–`1.0` con paso `0.01`. Si el usuario escribe manualmente un valor fuera, se muestra validación inline: «Threshold must be between 0.01 and 1.0». No se envía la petición. Al salir del input (onBlur), el valor inválido se queda visible con el aviso y la tabla mantiene los últimos datos válidos. El backend aceptaría threshold=0 (devuelve 6 alertas) pero el frontend lo bloquea |
| 2 | **Sin alertas para el umbral actual** — threshold alto (ej. 0.9) provoca que la API devuelva `[]` | La tabla muestra el mensaje explícito: **«No anomalies detected for threshold 0.90»**. La tabla no desaparece, y el input de umbral sigue operable para que el usuario pueda reducirlo |
| 3 | **Períodos iniciales sin 3 períodos previos** — no hay datos anteriores suficientes para calcular la media móvil | ❓ No verificado. La hipótesis es que la API no genera alertas para esos períodos (no hay `baseline_average` válido). El frontend no necesita tratarlo: si no hay alerta, no aparece en la respuesta. |
| 4 | **Threshold > 1.0** | La API devuelve `[]` (array vacío, sin error). La UI muestra el mensaje de vacío estándar. El frontend ya bloquea valores > 1.0 (ver caso 1), pero si por algún motivo llegara, se maneja como estado vacío |

### Componente asociado

Ver [`components.md`](./components.md) — `AlertsTable` (sección Funcionalidad 2).

### Notas de implementación

- **Posición (D12/D20):** `AlertsTable` se sitúa a ancho completo debajo de los gráficos existentes (income-outcome-chart, profit-percent-chart).
- **Carga (D10/D19):** Al abrir la página se cargan las alertas con threshold=0.3 y sin fechas. El threshold recarga la tabla al salir del input (onBlur), solo si es válido. Si es inválido, el valor se queda visible y la tabla mantiene los últimos datos válidos.
- **Formato (D11):** Moneda con `formatCurrency` (USD, sin decimales). Porcentajes con `formatPercent` (1 decimal).
- **Sin paginación (D14):** Todas las filas se muestran ordenadas por período.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

**Requisito PM:** [`pm-brief.md`](./pm-brief.md) — Funcionalidad 3

### Endpoints

| Ruta | Método | Propósito |
|---|---|---|
| `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=<grupo>` | GET | Top N categorías de ingreso para una línea de negocio concreta |
| `GET /api/metrics/categories/top?operation_type=income&limit=20&business_type=<grupo>` | GET | **Decisión D5.** Todas las categorías de ingreso del grupo, para sumar el `groupTotal` |
| `GET /api/metrics/facets` | GET | Obtener `business_types` disponibles y `categories` para validación |
| `GET /api/metrics` | GET | (Opcional) Obtener métricas adicionales si se necesitan |

### Tipos

| Archivo | Tipo | Propósito |
|---|---|---|
| [`api-types.ts`](./api-types.ts) → `CategoryEntry` | Respuesta (item) | `category: string`, `operation_type: string`, `total_amount: number` |
| [`api-types.ts`](./api-types.ts) → `TopCategoriesResponse` | Respuesta (array) | `CategoryEntry[]` |
| [`api-types.ts`](./api-types.ts) → `FacetsResponse` | Respuesta | `business_types: ('B2B' \| 'B2C')[]`, `categories: string[]`, `min_date`, `max_date` |
| [`param-types.ts`](./param-types.ts) → `TopCategoriesParams` | Parámetros | Extiende `DateRangeFilter`; añade `operation_type`, `limit`, `business_type` |

### Parámetros de `GET /api/metrics/categories/top`

| Parámetro | Tipo | Obligatorio | Valores válidos | Defecto |
|---|---|---|---|---|
| `operation_type` | `string` | No | `income` · `outcome` | `outcome` |
| `limit` | `integer` | No | Mín: `1`, Máx: `20` | `5` |
| `business_type` | `string` o `null` | No | `B2B` · `B2C` | `null` (todas) |
| `start_date` | `string` (date) o `null` | No | YYYY-MM-DD | `null` |
| `end_date` | `string` (date) o `null` | No | YYYY-MM-DD | `null` |

### Columnas de cada tabla (`CategoryTopPanel`)

| Columna | Dato | Tipo | Formato |
|---|---|---|---|
| Category | `category` | `string` | Nombre textual (ej. «sales», «others») |
| Total income | `total_amount` | `number` | `formatCurrency` (USD, sin decimales). **D11** |
| % of group | Calculado: `(total_amount / groupTotal) × 100` | `number` | `formatPercent` (1 decimal + «%»). **D11** (ej. «57.3%») |

> **groupTotal** se obtiene con una llamada adicional (Decisión D5, pendiente de confirmación del PM): `GET /api/metrics/categories/top?operation_type=income&limit=20&business_type=<grupo>` sumando todos los `total_amount`. **D13:** `limit=20` cubre todas las categorías porque la API solo admite 5 (enum verificado). **D15:** `facets.categories` se usa como lista de etiquetas válidas; los importes y el desglose B2B/B2C provienen de `categories/top`, no de `facets`.

### Casos límite

| # | Caso | Comportamiento esperado en UI |
|---|---|---|
| 1 | **Menos de 5 categorías** — para income solo existen 2 categorías (sales y others), así que la API devuelve 2 items aunque `limit=5` | **Decisión D4.** La tabla muestra exactamente las 2 categorías que devuelve la API. No se añaden filas vacías ni de relleno. El porcentaje se calcula correctamente contra el `groupTotal` real |
| 2 | **Un grupo sin ingresos en el período** — para B2B, el rango seleccionado no tiene movimientos de income | El panel de ese grupo muestra: **«No income categories for B2B in the selected period»**. El otro panel se renderiza con normalidad. El gráfico muestra la barra del grupo con datos con su valor real y la barra del grupo vacío en 0 |
| 3 | **Ambos grupos sin datos** — el rango de fechas seleccionado no contiene ingresos para ninguna línea de negocio | Ambos paneles muestran su mensaje de vacío individual. El `ComparativeChart` muestra ambas barras en 0 con la etiqueta: «No data for the selected period» |
| 4 | **Grupo con 0 categorías pero el otro con datos** — escenario de dato parcial | Ver caso 2. Se mantiene el layout de dos columnas paralelas. El gráfico muestra un contraste visual entre la barra con valor > 0 y la barra en 0 |

### Componentes asociados

Ver [`components.md`](./components.md) — `ComparativeView`, `CategoryTopPanel`, `ComparativeChart` (sección Funcionalidad 3).

### Notas de implementación

- **Navegación (D9):** Botón/pestaña en el header que cambia entre "Dashboard" y "B2B vs B2C". Sin librerías de rutas adicionales.
- **Datos (D8/D16):** `ComparativePage` orquesta las llamadas a `categories/top` (limit=5 y limit=20 por grupo) y `facets`, y pasa los resultados por props a los componentes.
- **Carga (D10/D20):** Al abrir la página se cargan los datos sin fechas. El filtro de fechas recarga todo al cambiar, solo si es válido. Al cambiar de pestaña, las fechas se reinician.
- **Formato (D11):** Moneda con `formatCurrency` (USD, sin decimales). Porcentajes con `formatPercent` (1 decimal). Gráfico con Recharts.
- **Categorías (D15):** `facets.categories` se usa como lista de etiquetas válidas para validación; los nombres y los importes provienen exclusivamente de `categories/top`.

---

## Referencia rápida de decisiones

| Decisión | Descripción | Ver en |
|---|---|---|
| **D1** | `start_date > end_date`: no enviar petición, mostrar aviso | [`components.md`](./components.md) Func. 1 §4, [`verification.md`](./verification.md) |
| **D2** | Una sola fecha filtra desde/hasta ese punto sin error | [`components.md`](./components.md) Func. 1 §4, [`verification.md`](./verification.md) |
| **D3** | Inputs limitados con `min`/`max` de `FacetsResponse` | [`components.md`](./components.md) Func. 1 §4, [`verification.md`](./verification.md) |
| **D4** | Menos de 5 categorías: mostrar las que haya sin relleno | [`components.md`](./components.md) Func. 3 §6, [`verification.md`](./verification.md) |
| **D5** | Total del grupo calculado con `limit=20` y suma de todos los items (pendiente PM) | [`components.md`](./components.md) Func. 3 §5, [`verification.md`](./verification.md) |
| **D6** | Threshold limitado a 0.01–1.0, paso 0.01, validación frontend | [`components.md`](./components.md) Func. 2 §5, [`verification.md`](./verification.md) |
| **D7** | Filtro de fechas independiente por página, componente reutilizable | [`components.md`](./components.md) Func. 1 §5 y Func. 3 §8, [`verification.md`](./verification.md) |
| **D8** | `DashboardPage` / `ComparativePage` hacen llamadas a la API; `App.tsx` alterna según pestaña (D16) | [`components.md`](./components.md) Func. 1 §5, Func. 2 §6, Func. 3 §8, [`verification.md`](./verification.md) |
| **D9** | Navegación: botón/pestaña en el header entre "Dashboard" y "B2B vs B2C". Sin librerías de rutas | [`components.md`](./components.md) Func. 3 §4 y §8, [`verification.md`](./verification.md) |
| **D10** | Al abrir página: sin fechas y threshold 0.3. Fechas recargan todo si válidas. Threshold recarga en onBlur si válido | [`components.md`](./components.md) Func. 1 §5, Func. 2 §6, Func. 3 §8, [`verification.md`](./verification.md) |
| **D11** | `formatCurrency` (USD, sin decimales), `formatPercent` (1 decimal), fechas YYYY-MM-DD, Recharts | [`components.md`](./components.md) Func. 2 §4, Func. 3 §5, [`verification.md`](./verification.md) |
| **D12** | `DateRangePicker` debajo del header y encima de KPIs; `AlertsTable` debajo de gráficos. Rango: "Available data: min – max" | [`components.md`](./components.md) Func. 1 §5, [`verification.md`](./verification.md) |
| **D13** | `limit=20` cubre todas las categorías (API solo admite 5). D5 pendiente | [`components.md`](./components.md) Func. 3 §5, [`verification.md`](./verification.md) |
| **D14** | `AlertsTable` sin paginación. | [`components.md`](./components.md) Func. 2 §6, [`verification.md`](./verification.md) |
| **D15** | `facets.categories` como lista de etiquetas válidas; importes de `categories/top`. Confirmado PM (sustituye a D14 sobre facets) | [`components.md`](./components.md) Func. 3 §8, [`verification.md`](./verification.md) |
| **D16** | `DashboardPage` y `ComparativePage` orquestan API. `App.tsx` solo alterna entre páginas | [`components.md`](./components.md) Func. 1 §5, Func. 3 §8, [`verification.md`](./verification.md) |
| **D17** | Textos de UI en inglés, formato `en-US` con punto decimal | [`components.md`](./components.md) Func. 1 §5, [`verification.md`](./verification.md) |
| **D18** | `onRangeChange` automático al cambiar fecha, sin botón Aplicar | [`components.md`](./components.md) Func. 1 §5, [`verification.md`](./verification.md) |
| **D19** | Threshold inválido en onBlur: valor visible con aviso, tabla mantiene últimos datos válidos. Input `type="number"` | [`components.md`](./components.md) Func. 2 §5, [`verification.md`](./verification.md) |
| **D20** | DashboardHeader muestra rango filtrado. AlertsTable a ancho completo. Fechas se reinician al cambiar pestaña. Helper texts de KPIs no cambian | [`components.md`](./components.md) Func. 1 §5, Func. 2 §6, Func. 3 §8, [`verification.md`](./verification.md) |
| **D21** | Tests fuera de esta spec; seguir `.agents/rules/testing.md` | [`components.md`](./components.md) Func. 1 §5, [`verification.md`](./verification.md) |

---

## Estructura del directorio `specs/`

| Archivo | Propósito |
|---|---|
| [`pm-brief.md`](./pm-brief.md) | Requisitos originales del PM. No editar |
| [`verification.md`](./verification.md) | Verificación contra OpenAPI + respuestas reales + decisiones |
| [`api-types.ts`](./api-types.ts) | Tipos de respuesta de la API (vendored de openapi.json) |
| [`param-types.ts`](./param-types.ts) | Tipos de parámetros query (snake_case, mirando openapi.json) |
| [`components.md`](./components.md) | Especificación de componentes UI (props, estados, layout) |
| **`README.md`** (este archivo) | Punto de entrada: endpoints, tipos, parámetros, casos límite |