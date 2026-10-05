---
description: Mantener sincronizado el contrato de datos entre FastAPI y los tipos TypeScript
globs: ["backend/app/routes.py", "frontend/src/lib/financial-types.ts"]
alwaysApply: false
---

# Contrato de datos backend ↔ frontend

**Nombre:** Un cambio de forma de datos se aplica en los dos lados

**Alcance:** modelos y alias de tipo de `backend/app/routes.py` y sus equivalentes en `frontend/src/lib/financial-types.ts`

**Justificación:**
- El contrato está duplicado a mano: `OperationType`, `Category`, `BusinessType` y `FinancialMovement` existen en `routes.py:11-27` y en `financial-types.ts:1-11`.
- No hay generación de tipos ni test que los compare, y `App.tsx` hace `response.json()` sin validar, así que un desajuste no lo detecta nadie. (finding F3)

## Guía específica del proyecto

- **Campo nuevo, renombrado o eliminado** en `FinancialMovement` (Pydantic) ⇒ el mismo cambio en `interface FinancialMovement` (TS), en la misma tarea.
- **Literales:** si cambias `Category = Literal["suppliers", "sales", "operational", "administrative", "others"]`, actualiza `export type Category = 'suppliers' | 'sales' | ...`, y lo mismo para `OperationType` y `BusinessType`.
- **Nombres en `snake_case`** tal como los serializa la API (`create_date`, `operation_type`, `business_type`). No traducirlos a camelCase en los tipos que representan la respuesta.
- **Fechas:** viajan como texto ISO `YYYY-MM-DD` (`create_date: date` en Python, `create_date: string // ISO date` en TS).
- **Tipos derivados** que solo usa el cliente (`KPIMetrics`, `MonthlyDataPoint`) sí usan camelCase. No mezclarlos con los de la API.
- **Objetos `FinancialMovement` escritos a mano en el frontend:** `tsc -b` compila todo `src/` (`tsconfig.app.json` → `"include": ["src"]`). Un campo obligatorio nuevo rompe el build en:
  - `src/lib/financial-utils.test.ts` (`sampleMovements` y los datos de cada test): actualizarlos.
  - `src/lib/mock-data.ts`: no se usa, pero también se compila. Actualizarlo, o preguntar antes si se prefiere borrarlo. No borrarlo por iniciativa propia ni hacer el campo opcional solo en TS para esquivar el error.
- **Campos derivados en los datos simulados:** calcularlos a partir de valores que ya existen (por ejemplo de `category`), sin llamadas nuevas a `random`. Cada llamada extra desplaza la secuencia de `seed=42` y cambia todos los importes y fechas.
- **Antes de dar por bueno un campo existente**, compruébalo en una respuesta real (`/api/metrics`) o en `/openapi.json`. Un campo nuevo se comprueba igual, una vez implementado. No inventes campos.
- **Decisiones de negocio** (si es obligatorio u opcional, longitud, idioma del contenido, si se muestra en la UI): si la tarea no las fija, preguntar antes de implementar.

## Comprobación

- Mismos nombres y literales en los dos archivos (revisar el diff de ambos).
- `npm run build` (tipos) y `python -m pytest` en verde.
