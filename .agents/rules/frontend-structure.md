---
description: Estructura, estilo, textos y estados de UI del frontend React + Vite
globs: ["frontend/src/**/*.{ts,tsx}"]
alwaysApply: false
---

# Estructura del frontend

**Nombre:** Seguir la organización y el estilo existentes del dashboard

**Alcance:** `frontend/src/` (componentes, `lib/`, `App.tsx`)

**Justificación:**
- Los componentes del dashboard son de presentación y los cálculos viven en `src/lib/financial-utils.ts`. (findings F4, F5)
- No hay formateador, y cada archivo tiene su propio estilo. (F6)
- La UI está en inglés con formato `en-US`/USD. (F7)
- Cargando, vacío y error ya tienen un patrón. (F8)
- `mock-data.ts` está sin uso. (F17)

## Guía específica del proyecto

- **Dónde va cada cosa:**
  - Piezas visuales del dashboard → `src/components/dashboard/<nombre-en-kebab>.tsx`, con exportación nombrada en PascalCase (`export function KPICard`).
  - Primitivas de shadcn → `src/components/ui/` (por ahora solo `card.tsx` y `skeleton.tsx`).
  - Cálculos y formateo → `src/lib/financial-utils.ts`, como funciones puras.
  - Tipos → `src/lib/financial-types.ts`.
- **Imports:** usar el alias `@/` (`import { Card } from '@/components/ui/card'`), salvo imports relativos entre archivos de la misma carpeta, como ya hace `kpi-row.tsx` con `./kpi-card`.
- **Estilo:** respetar el del archivo que se edita.
  - `App.tsx` y `financial-utils.ts`: comillas dobles y `;`.
  - `components/dashboard/*` y `financial-types.ts`: comillas simples sin `;`.
  - No reformatear líneas ajenas al cambio.
- **Textos de UI:** en inglés, como los existentes ("Financial Overview", "No data available to display").
- **Formato:** con `formatCurrency` (`en-US`, USD, sin decimales) y `formatPercent` (1 decimal). No cambiar moneda ni locale sin pedirlo.
- **Estados:** todo componente que recibe datos acepta `loading?: boolean`.
  - Cargando: muestra `Skeleton` (`kpi-card.tsx:37-50`).
  - Vacío: muestra un mensaje explícito (`"No data available to display"` en los gráficos).
  - Error: `App.tsx` muestra el aviso. No eliminar ni ocultar estos estados.
- **Datos:** la fuente es `GET /api/metrics` a través de `API_BASE_URL` (`App.tsx:13-16`).
  - No importar `src/lib/mock-data.ts`: está sin uso y contiene fechas de 2024 que no coinciden con la API.
  - El periodo del encabezado se calcula con `formatPeriodLabel(movements)` a partir de los datos cargados. No volver a escribir un periodo fijo.
- **Fechas `YYYY-MM-DD`:** para agrupar u ordenar, trabajar con el texto (`create_date.slice(0, 7)`, `.sort()`), como hace `formatPeriodLabel`.
  - `new Date("YYYY-MM-DD")` interpreta la fecha en UTC, y `getMonth()` la lee en hora local. En zonas al oeste de UTC, el día 1 puede caer en el mes anterior.
  - `computeMonthlyData` aún usa ese patrón; no extenderlo a código nuevo.
- **Sin rediseños:** no cambiar estilos Tailwind ni variables CSS de `index.css` si la tarea no lo pide.

## Comprobación

- `npm run lint`, `npm test` y `npm run build` desde `frontend/` sin errores.
- El diff solo toca líneas relacionadas con la tarea.
