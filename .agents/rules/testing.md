---
description: Qué tests escribir y qué comandos ejecutar antes de dar una tarea por terminada
globs: ["backend/**/*.py", "frontend/src/**/*.{ts,tsx}"]
alwaysApply: false
---

# Testing y verificación

**Nombre:** Cada cambio deja su test y su suite en verde

**Alcance:** `backend/tests/`, `frontend/src/**/*.test.ts` y comandos de verificación

**Justificación:**
- Hay dos suites: `backend/tests/test_routes.py` (`pytest`) y `frontend/src/lib/financial-utils.test.ts` (`vitest`). En el handover ningún README explicaba cómo ejecutarlas. (findings F11, F12)
- Los datos dependen de la fecha actual. (F2)
- No se anotan aquí recuentos de tests, porque se desactualizan con cada tarea. El número real lo da la salida del comando.

## Guía específica del proyecto

**Backend:**
- Los tests van en `backend/tests/test_routes.py`, con el cliente ya definido: `client = TestClient(app)`.
- Se ejecutan **desde `backend/`**, porque `tests/conftest.py` añade esa carpeta al `sys.path`:
  ```bash
  cd backend && python -m pytest
  ```
- Un test por comportamiento, con nombre descriptivo en `snake_case` (`test_<qué>_<resultado>`), como `test_b2b_endpoint_only_returns_b2b_records`.

**Frontend:**
- Los tests de lógica van junto al archivo (`financial-utils.test.ts`), con `describe` / `it` de `vitest` y datos de ejemplo locales (`sampleMovements`).
  ```bash
  cd frontend && npm test && npm run lint && npm run build
  ```

**Fechas:** en tests nuevos del backend no escribir fechas fijas; derivarlas de la respuesta. Ejemplo: `first_date = base_response.json()[0]["create_date"]` en `test_metrics_endpoint_respects_date_filters`.
- Excepción heredada: `test_metrics_comparison_returns_delta_fields` usa `"2025-03-01"` / `"2025-03-31"`. Solo comprueba la forma de la respuesta, así que pasa con cualquier fecha. No copiar ese patrón para comprobar valores.
- En el frontend sí se usan fechas fijas, porque los datos de prueba son locales (`sampleMovements`) y no dependen de la API.

**Qué ejecutar según el cambio:**

| Cambio | Ejecutar |
|---|---|
| `backend/app/**` | `python -m pytest` (desde `backend/`) |
| `frontend/src/lib/**` | `npm test` |
| cualquier `frontend/src/**` | `npm run lint` y `npm run build` |
| solo documentación | ningún test; comprobar que comandos y rutas citados existen |

- **No borrar ni debilitar tests** para que pasen. Si un test falla por el cambio, explicar por qué y ajustar el código o el test con justificación.
- **Casos límite:** se pueden agrupar en un test si comprueban un único comportamiento. Ejemplo: `test_top_categories_accepts_limit_range_edges` recorre `limit` 1 y 20.
- **Informar del resultado real** (número de tests y avisos). Avisos conocidos hoy: deprecación de Starlette sobre `httpx` en pytest y chunk mayor de 500 kB en `vite build`.

## Comprobación

La salida de los comandos de la tabla figura en el resumen de la tarea.
