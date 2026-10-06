# Componentes del frontend

> Especificación de componentes basada en `pm-brief.md`, `verification.md`, `api-types.ts` y `param-types.ts`.
> No incluye código React ni JSX.

---

## Funcionalidad 1 — Filtro de rango de fechas

### 1. Propósito

Permitir al usuario seleccionar un intervalo de fechas (inicio y fin, ambos opcionales) que filtre todos los datos del dashboard, mostrando el rango de fechas disponible extraído de `FacetsResponse` para que el usuario sepa qué intervalo es válido.

### 2. Componentes

| Componente | Responsabilidad |
|---|---|
| `DateRangePicker` | Inputs de fecha inicio/fin + indicador del rango disponible |

### 3. Props de `DateRangePicker`

| Nombre | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `startDate` | `string` (formato YYYY-MM-DD) | No | Fecha de inicio seleccionada. `null` / `undefined` cuando no hay ninguna |
| `endDate` | `string` (formato YYYY-MM-DD) | No | Fecha de fin seleccionada. `null` / `undefined` cuando no hay ninguna |
| `availableMinDate` | `string` (formato YYYY-MM-DD) | Sí | Fecha más antigua del dataset; valor de `FacetsResponse.min_date` |
| `availableMaxDate` | `string` (formato YYYY-MM-DD) | Sí | Fecha más reciente del dataset; valor de `FacetsResponse.max_date` |
| `onRangeChange` | `(start: string \| null, end: string \| null) => void` | Sí | Callback ejecutado cuando el usuario confirma un cambio de rango válido |

### 4. Estados

| Estado | Qué ve exactamente el usuario |
|---|---|
| **Cargando** | Ambos inputs muestran un marcador de posición (placeholder). Debajo o al lado se lee «Rango disponible: cargando…» |
| **Vacío** | No aplica: el componente siempre muestra los dos inputs. Cuando ambos están vacíos, no hay filtro activo y se muestra todo el rango disponible |
| **Error** | Si `GET /api/metrics/facets` falla, se muestra un mensaje de error: «No se pudo obtener el rango de fechas disponible». Los inputs funcionan sin restricción de `min`/`max` |
| **Dato parcial — solo una fecha rellena** | **Decisión D2.** Si solo se rellena `startDate`, el dashboard filtra desde esa fecha en adelante (sin límite superior). Si solo se rellena `endDate`, filtra hasta esa fecha (sin límite inferior). No se muestra ningún error |
| **Dato inválido — inicio posterior a fin** | **Decisión D1.** El componente detecta `startDate > endDate`, muestra un aviso en línea: «La fecha de inicio no puede ser posterior a la de fin» y **no** ejecuta `onRangeChange`. El botón/acción de aplicar filtro permanece deshabilitado |
| **Fecha fuera del rango disponible** | **Decisión D3.** Los inputs usan `min={availableMinDate}` y `max={availableMaxDate}` del navegador, por lo que el usuario no puede seleccionar una fecha fuera del rango. Si por alguna razón ocurre (p. ej. datos desactualizados), se comporta como dato inválido |

### 5. Decisiones aplicadas

- **D1** — `start_date > end_date`: el frontend detecta la incoherencia, muestra aviso y no envía la petición.
- **D2** — Solo una fecha rellena: `start_date` sola filtra desde esa fecha en adelante; `end_date` sola filtra hasta esa fecha.
- **D3** — Fecha fuera del rango disponible: los inputs se limitan con `min=min_date` y `max=max_date` obtenidos de `FacetsResponse`.
- **D7** — El filtro de fechas es independiente por página, pero todas las páginas usan el mismo componente `DateRangePicker` reutilizable.

---

## Funcionalidad 2 — Tabla de alertas de anomalías

### 1. Propósito

Mostrar una tabla con los períodos en los que el gasto (outcome) superó significativamente su media histórica, permitiendo al usuario ajustar la sensibilidad de detección mediante un umbral numérico.

### 2. Componentes

| Componente | Responsabilidad |
|---|---|
| `AlertsTable` | Input de umbral + tabla con las 4 columnas de alertas + estado vacío explícito |

### 3. Props de `AlertsTable`

| Nombre | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `alerts` | `AlertEntry[]` (de `api-types.ts`) | Sí | Array de alertas devuelto por `GET /api/metrics/alerts`. Cada elemento tiene: `period`, `outcome_total`, `baseline_average`, `increase_ratio` |
| `threshold` | `number` | Sí | Valor actual del umbral (0.01–1.0, paso 0.01). Defecto: 0.3. Se usa en el mensaje de estado vacío |
| `onThresholdChange` | `(newThreshold: number) => void` | Sí | Callback ejecutado cuando el usuario cambia el umbral a un valor válido |

### 4. Columnas de la tabla

| Columna | Dato (`AlertEntry`) | Formato de visualización |
|---|---|---|
| **Período** | `period: string` | Se muestra tal cual («2025-12», «2026-03», etc.). Si `group_by=month` el formato es «YYYY-MM» |
| **Outcome registrado** | `outcome_total: number` | Formato moneda con 2 decimales y separador de miles (ej. «103.378,98 €» o «$103,378.98» según locale) |
| **Media móvil (3 períodos)** | `baseline_average: number` | Formato moneda con 2 decimales y separador de miles |
| **Incremento porcentual** | `increase_ratio: number` | **Decisión D4 del PM.** El ratio se multiplica por 100 y se añade el símbolo «%». Ejemplos: `1.0201` → «102,01 %»; `0.5601` → «56,01 %»; `0.3864` → «38,64 %» |

### 5. Estados

| Estado | Qué ve exactamente el usuario |
|---|---|
| **Cargando** | La tabla muestra un indicador de carga (skeleton / spinner) en la zona que ocuparán las filas. El input de umbral permanece habilitado |
| **Vacío** | Se muestra un mensaje explícito: **«No se detectaron anomalías para el umbral 0,30»** (con el valor actual de `threshold` formateado). La tabla no desaparece; se ve el mensaje en el área que ocuparían las filas. El input de umbral sigue operable para reducir el umbral y obtener resultados |
| **Error** | Si `GET /api/metrics/alerts` falla, se muestra: «Error al cargar las alertas. Inténtalo de nuevo.» |
| **Dato inválido — threshold fuera de 0.01–1.0** | **Decisión D6.** El input numérico está limitado al rango `0.01`–`1.0` con paso `0.01`. Si el usuario teclea un valor fuera de ese rango, se muestra una validación inline: «El umbral debe estar entre 0,01 y 1,0». No se envía la petición a la API. El valor por defecto es `0.3` |
| **Sin datos de fecha** | Si no hay rango de fechas seleccionado, se muestran todas las alertas disponibles. Si hay rango, la tabla solo muestra las alertas dentro del intervalo (la API lo gestiona mediante los parámetros `start_date` y `end_date` de `AlertsParams`) |

### 6. Decisiones aplicadas

- **D6** — Threshold fuera de 0.01–1.0: el input se limita al rango 0.01–1.0, paso 0.01, defecto 0.3. No se envía la petición si está fuera.
- **D4 del PM** — `increase_ratio` se multiplica por 100 y se muestra como porcentaje (la API devuelve ratio, no porcentaje).
- **D1 / D2 / D3** — El componente respeta el filtro de fechas de la Funcionalidad 1 (si está activo) mediante los parámetros `start_date` y `end_date` de `AlertsParams`.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

### 1. Propósito

Crear una nueva página que compara los ingresos (income) de las dos líneas de negocio, mostrando las 5 categorías principales de cada una con su porcentaje sobre el total del grupo, junto con un gráfico comparativo del total de ingresos de B2B frente a B2C.

### 2. Componentes

| Componente | Responsabilidad |
|---|---|
| `ComparativeView` | Página completa: orquesta la carga de datos y contiene los dos paneles y el gráfico |
| `CategoryTopPanel` | Panel individual que muestra la tabla top-5 de un grupo de negocio. Se instancia dos veces (B2B y B2C) |
| `ComparativeChart` | Gráfico de barras (o similar) que compara el total de ingresos de B2B vs B2C |

### 3. Props de cada componente

#### `ComparativeView`

| Nombre | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `b2bCategories` | `CategoryEntry[]` (de `api-types.ts`) | Sí | Top categorías de income para B2B, ordenadas por `total_amount` descendente. Se muestran solo las primeras 5 |
| `b2cCategories` | `CategoryEntry[]` (de `api-types.ts`) | Sí | Top categorías de income para B2C, ordenadas por `total_amount` descendente. Se muestran solo las primeras 5 |
| `b2bTotal` | `number` | Sí | Suma de todos los `total_amount` de income para B2B (ver Decisión D5) |
| `b2cTotal` | `number` | Sí | Suma de todos los `total_amount` de income para B2C (ver Decisión D5) |
| `startDate` | `string` (YYYY-MM-DD) | No | Fecha de inicio del filtro de fechas (`DateRangeFilter`) |
| `endDate` | `string` (YYYY-MM-DD) | No | Fecha de fin del filtro de fechas (`DateRangeFilter`) |

#### `CategoryTopPanel`

| Nombre | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `businessType` | `'B2B' \| 'B2C'` | Sí | Línea de negocio que representa este panel |
| `categories` | `CategoryEntry[]` | Sí | Lista de categorías a mostrar (máximo 5) |
| `groupTotal` | `number` | Sí | Total de ingresos del grupo; se usa para calcular el porcentaje de cada categoría |
| `title` | `string` | Sí | Cabecera del panel, p. ej. «B2B — Top categorías de ingreso» |

#### `ComparativeChart`

| Nombre | Tipo | Obligatoria | Descripción |
|---|---|---|---|
| `b2bTotal` | `number` | Sí | Total de ingresos del grupo B2B |
| `b2cTotal` | `number` | Sí | Total de ingresos del grupo B2C |

### 4. Layout

```
┌──────────────────────────────────────┐
│        [DateRangePicker]              │  ← filtro de fechas reutilizable
├──────────────────┬───────────────────┤
│  CategoryTopPanel│ CategoryTopPanel  │  ← dos paneles en paralelo
│      B2B         │      B2C          │
│  ┌──────────────┐│┌───────────────┐  │
│  │ Categoría    │││ Categoría     │  │
│  │ Sales  57%   │││ Sales  58%    │  │
│  │ Others 43%   │││ Others  42%   │  │
│  └──────────────┘│└───────────────┘  │
├──────────────────┴───────────────────┤
│       ComparativeChart               │  ← gráfico comparativo B2B vs B2C
│    ┌──────────────────────────┐      │
│    │  ████████  ██████████    │      │
│    │  1.13M     1.22M         │      │
│    │  B2B       B2C           │      │
│    └──────────────────────────┘      │
└──────────────────────────────────────┘
```

### 5. Detalle de cada tabla (CategoryTopPanel)

Cada fila del panel muestra:

| Columna | Dato | Formato |
|---|---|---|
| **Categoría** | `category: string` | Nombre de la categoría (ej. «sales», «others») |
| **Total ingresos** | `total_amount: number` | Formato moneda con 2 decimales y separador de miles |
| **% sobre el grupo** | Calculado: `(total_amount / groupTotal) × 100` | Porcentaje con 1 decimal más símbolo «%» (ej. «57,3 %») |

> **Decisión D5.** El `groupTotal` se obtiene llamando a `GET /api/metrics/categories/top?operation_type=income&limit=20&business_type=<grupo>` y sumando todos los `total_amount` devueltos. Con `limit=20` se capturan todas las categorías existentes de income (actualmente 2). La tabla muestra solo las 5 primeras (o menos si la API devuelve menos), pero el porcentaje se calcula contra el total real del grupo.

### 6. Estados

| Estado | Qué ve exactamente el usuario |
|---|---|
| **Cargando** | Ambos `CategoryTopPanel` muestran un skeleton cada uno (título del panel + 5 filas esqueleto). El `ComparativeChart` también muestra un skeleton o un mensaje «Cargando datos comparativos…» |
| **Vacío — panel individual sin categorías** | El panel muestra el mensaje: **«No hay categorías de ingreso para B2B en el período seleccionado»** (usando el `businessType` correspondiente). El otro panel, si tiene datos, se muestra con normalidad. El layout de dos columnas se mantiene |
| **Vacío — ambos paneles sin datos** | Ambos paneles muestran su mensaje de vacío individual. El `ComparativeChart` muestra ambas barras en 0 con la etiqueta «Sin datos para el período seleccionado» |
| **Error** | Si falla la carga de datos de un grupo, se muestra en el panel afectado: «Error al cargar los datos de B2B. Inténtalo de nuevo.» El otro panel continúa operativo. Si fallan ambos, se muestra un error global en la página |
| **Dato parcial — un grupo tiene categorías y el otro no** | El panel con datos se renderiza normalmente (con sus 5 filas). El panel sin datos muestra el mensaje de vacío. El gráfico muestra la barra del grupo con datos en su valor real y la barra del grupo vacío en 0 |
| **Dato parcial — menos de 5 categorías** | **Decisión D4.** La tabla muestra exactamente las categorías que devuelve la API, aunque sean menos de 5. No se añaden filas vacías ni de relleno |

### 7. Gráfico comparativo (`ComparativeChart`)

| Elemento | Representa |
|---|---|
| **Barra / punto «B2B»** | `b2bTotal`: suma de todos los ingresos del grupo B2B en el período seleccionado (o en todo el histórico si no hay filtro de fechas) |
| **Barra / punto «B2C»** | `b2cTotal`: suma de todos los ingresos del grupo B2C en el período seleccionado (o en todo el histórico si no hay filtro de fechas) |
| **Eje Y** | Escala monetaria (en millones / miles según magnitud) |
| **Etiquetas** | Valor numérico formateado como moneda sobre cada barra/punto |

Si ambos totales son 0 (sin datos), el gráfico muestra las dos barras en 0 y un mensaje: «No hay datos para el período seleccionado».

### 8. Decisiones aplicadas

- **D4** — Grupo con menos de 5 categorías: la tabla muestra las que devuelva la API.
- **D5** — Total del grupo para porcentajes: se pide con `limit=20` y se suman todos los `total_amount`. La tabla muestra las 5 primeras categorías con su porcentaje sobre esa suma.
- **D7** — El filtro de fechas es independiente por página; la vista comparativa usa su propia instancia de `DateRangePicker`.
- **D1 / D2 / D3** — El filtro de fechas de esta página sigue las mismas reglas de validación que la Funcionalidad 1.