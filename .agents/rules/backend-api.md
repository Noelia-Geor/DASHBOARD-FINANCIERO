---
description: Cómo añadir o cambiar endpoints, modelos y datos del backend FastAPI
globs: ["backend/app/**/*.py"]
alwaysApply: false
---

# Backend API (FastAPI)

**Nombre:** Extender la API dentro de su estructura actual

**Alcance:** `backend/app/routes.py`, `backend/app/main.py`

**Justificación:**
- Toda la API (alias de tipo, modelos Pydantic, generación de datos, helpers y los 9 endpoints) vive en `routes.py` sobre un único `router`. `main.py` solo lo monta y añade CORS. (findings F1, F9, F10)
- Los datos son simulados (`generate_mock_movements(seed=42)`) y sus fechas son relativas a `date.today()`. (F2)

## Guía específica del proyecto

- **Dónde va un endpoint nuevo:** en `routes.py`, decorado con `@router.get(...)` y con `response_model`, igual que los existentes:
  ```python
  @router.get("/api/metrics/categories/top", response_model=list[TopCategoryItem])
  def get_top_categories(
      operation_type: OperationType = Query(default="outcome"),
      limit: int = Query(default=5, ge=1, le=20),
      ...
  ```
- **Rutas:** las de negocio cuelgan de `/api/metrics/...`. Solo `/health` queda fuera de `/api`.
- **Datos:** obtenerlos con `generate_mock_movements(seed=42)` y filtrarlos con `filter_movements(...)`. Para agregados, reutilizar `summarize_movements`, `build_top_categories` o `calculate_net_value`, sin duplicar bucles.
- **Validación:** con tipos (`OperationType`, `Category`, `BusinessType`, `GroupBy`) y restricciones de `Query` (`ge`, `le`). No escribir `if` manuales que devuelvan errores: FastAPI ya devuelve 422.
- **Respuestas:** definir un modelo `BaseModel` nuevo junto a los existentes. Nunca devolver diccionarios sin tipar, salvo el `{"status": "ok"}` de `/health`.
- **No crear** routers, módulos, capas de servicio ni base de datos nuevos salvo que la tarea lo pida.
- **No cambiar** la semilla 42 ni la lógica de fechas sin pedirlo: los tests y el frontend dependen de ello.
- **No añadir llamadas a `random`** en `_build_movement` ni en `generate_mock_movements`: cualquier llamada extra cambia todos los datos generados. Los valores nuevos se derivan de los existentes.
- **CORS:** no tocar `main.py:7-13` (`allow_origins=["*"]` con credenciales). Si la tarea lo exige, avisar del riesgo antes.
- **Contrato:** si el cambio afecta a la forma de los datos, aplicar también `api-contract.md`.

## Comprobación

- Test nuevo o actualizado en `backend/tests/test_routes.py` (ver `testing.md`).
- `python -m pytest` desde `backend/` en verde.
- La ruta nueva aparece en `http://localhost:8000/openapi.json`.
