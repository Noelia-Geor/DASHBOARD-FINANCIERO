# Hallazgos de ingeniería

Convenciones útiles y patrones de riesgo que afectan a futuros contribuidores y agentes.

- Solo se conservan hallazgos ligados a un archivo o a un comportamiento observado. La evidencia de ejecución está en `verification.md`.
- Cada hallazgo propone una regla (R#). Las reglas se implementan en `.agents/rules/` (Fase 3).

## Arquitectura

**F1. Toda la API vive en un único módulo.**
- *Evidencia:* `backend/app/routes.py` concentra los alias de tipo (`OperationType`, `Category`, `BusinessType`, `GroupBy`, líneas 11-15), los modelos Pydantic, la generación de datos, los helpers de filtrado/agregación y los 9 endpoints sobre `router = APIRouter()`. `main.py` solo crea la app, añade CORS e incluye el router.
- *Riesgo:* un agente puede crear módulos, routers o capas nuevas sin necesidad y fragmentar un backend de un solo archivo.
- **R1 →** Los endpoints nuevos van en `routes.py`, sobre `router`, con `response_model` Pydantic y reutilizando `filter_movements` / `summarize_movements`.

**F2. Datos simulados y relativos a la fecha actual.**
- *Evidencia:* cada endpoint llama a `generate_mock_movements(seed=42)`. Las fechas dependen de `date.today()` (`_year_for_month`, líneas 65-68). La ejecución del 2026-10-05 devolvió datos de `2025-10-02` a `2026-09-28`.
- *Riesgo:* tests o textos con fechas fijas dejan de ser ciertos con el paso del tiempo. Ya pasa: el `"2024 - Full Year"` de `App.tsx:49`.
- **R2 →** No escribir fechas fijas en tests ni en la UI. Derivarlas de los datos generados, como ya hace `test_metrics_endpoint_respects_date_filters`.

**F3. Contrato de datos duplicado a mano entre backend y frontend.**
- *Evidencia:* `routes.py:11-15` y el modelo `FinancialMovement` (líneas 22-27) se replican en `frontend/src/lib/financial-types.ts:1-11`. Los campos son `snake_case` en ambos lados (`create_date`, `operation_type`, `business_type`). No hay generación de tipos ni test que compare ambos.
- *Riesgo:* cambiar un campo o un literal en un lado rompe el otro en silencio. TypeScript no lo detecta porque `response.json()` no se valida.
- **R3 →** Todo cambio de modelo o literal se aplica en los dos archivos en la misma tarea, y los nombres de la API se mantienen en `snake_case`.

**F4. El frontend consume un solo endpoint y calcula en el cliente.**
- *Evidencia:*
  - `App.tsx:16` solo pide `/api/metrics`. KPIs y series mensuales se calculan en `src/lib/financial-utils.ts` (`computeKPIs`, `computeMonthlyData`).
  - Los componentes de `components/dashboard/` solo reciben props y un flag `loading`.
  - Los otros 7 endpoints de métricas no tienen consumidor.
- **R4 →** La lógica de cálculo va en `src/lib/financial-utils.ts`, como funciones puras con test. Los componentes siguen siendo de presentación (props + `loading`).

## Naming y estilo

**F5. Convenciones de nombres consistentes.**
- *Evidencia:*
  - Archivos en kebab-case (`kpi-card.tsx`, `income-outcome-chart.tsx`).
  - Componentes como exportación nombrada en PascalCase (`export function KPICard`).
  - Imports con el alias `@/` (`vite.config.ts:19-21`, `tsconfig.app.json` `paths`).
  - Primitivas UI de shadcn en `components/ui/` (`components.json`).
- **R5 →** Mantener kebab-case en archivos, PascalCase en componentes, imports con `@/` y nuevas piezas visuales en `components/dashboard/`.

**F6. Estilo de código mixto sin formateador.**
- *Evidencia:* `App.tsx` y `financial-utils.ts` usan comillas dobles y punto y coma. `kpi-card.tsx`, `kpi-row.tsx`, `dashboard-header.tsx` y `financial-types.ts` usan comillas simples sin punto y coma. No hay configuración de Prettier; ESLint (`eslint.config.js`) no impone estilo.
- *Riesgo:* un agente reformatea archivos enteros y genera diffs enormes y ruidosos.
- **R6 →** Respetar el estilo del archivo que se edita y no reformatear líneas que no forman parte del cambio.

**F7. Idioma y formato de la UI.**
- *Evidencia:*
  - Los textos visibles están en inglés (`dashboard-header.tsx:15-16`, etiquetas de `kpi-row.tsx`).
  - El formato es `en-US` y USD (`financial-utils.ts:15,70-72`).
  - Excepción: el mensaje de error de `App.tsx:37` está en español y sin tilde ("informacion").
- **R7 →** Los textos nuevos de UI siguen el idioma y el formato existentes (inglés, `en-US`, USD), salvo petición explícita. No cambiar moneda ni locale por iniciativa propia.

## Manejo de errores

**F8. Estados de carga, vacío y error ya definidos.**
- *Evidencia:*
  - `App.tsx:35-39` captura cualquier error y muestra un mensaje genérico, descartando la causa.
  - Los gráficos muestran "No data available to display" con datos vacíos (`income-outcome-chart.tsx:75`, `profit-percent-chart.tsx:76`).
  - Las KPIs pintan `Skeleton` mientras cargan (`kpi-card.tsx:37-50`).
- **R8 →** Todo componente nuevo cubre los mismos tres estados (cargando, vacío, error) con el patrón existente.

**F9. La validación de entrada la hace FastAPI.**
- *Evidencia:* parámetros tipados con `Literal` y `Query(ge=..., le=...)`, por ejemplo `limit: int = Query(default=5, ge=1, le=20)` (`routes.py:290`) y `threshold ... ge=0` (`routes.py:344`). Los valores inválidos devuelven 422 sin código manual.
- **R9 →** Validar parámetros con tipos y restricciones de `Query`, no con `if` manuales.

**F10. CORS totalmente abierto con credenciales.**
- *Evidencia:* `main.py:7-13`: `allow_origins=["*"]` con `allow_credentials=True`.
- **R10 →** No ampliar ni cambiar la política CORS sin pedirlo. Si una tarea lo toca, señalar el riesgo.

## Testing

**F11. Dos suites con comandos distintos, no documentadas en los READMEs.**
- *Evidencia:*
  - Backend: `pytest` desde `backend/`. `tests/conftest.py` añade la raíz del backend al `sys.path`, y `test_routes.py` usa `TestClient(app)`. Resultado: 15 tests.
  - Frontend: `npm test` (`vitest run`). Solo existe `src/lib/financial-utils.test.ts`, sin tests de componentes. Resultado: 5 tests.
  - Ningún README menciona cómo ejecutarlos.
- **R11 →** Cambio en un endpoint ⇒ test en `backend/tests/test_routes.py`. Cambio en un cálculo ⇒ test en `financial-utils.test.ts`. Antes de dar una tarea por terminada, ejecutar la suite afectada.

**F12. El build es la comprobación de tipos.**
- *Evidencia:*
  - `npm run build` = `tsc -b && vite build`, con `noUnusedLocals` y `noUnusedParameters` (`tsconfig.app.json`).
  - `npm run lint` = `eslint .`. Los dos pasan hoy; el build solo avisa de un chunk mayor de 500 kB.
- **R12 →** Si se cambia el frontend, `npm run lint` y `npm run build` deben seguir sin errores.

## Documentación

**F13. Los READMEs son bilingües y se actualizan juntos.**
- *Evidencia:* `cbd20dc` ("Adapt readmes") y `eeece05` modifican `README.md` y `README.es.md` en el mismo commit. Hoy divergen en el título por el commit de prueba `1f38829`.
- **R13 →** Todo cambio de documentación de uso se aplica en `README.md` y `README.es.md` a la vez.

**F14. Huecos en la documentación de ejecución.**
- *Evidencia:*
  - El README no menciona el puerto 5678 de debugpy (`docker-compose.yml:20`).
  - Afirma que no hacen falta variables "en desarrollo local", pero el proxy solo funciona en Docker (corrección C1 de `verification.md`).
  - `AGENTS.md` remitía a carpetas que no existían.
- **R14 →** Documentar solo comandos, puertos y URLs comprobados, y citar la fuente (`docker-compose.yml`, Dockerfiles, `package.json`).

## DX / Entorno

**F15. El proxy de Vite depende de la red de Docker.**
- *Evidencia:*
  - `vite.config.ts:13`: `target: "http://backend:8000"`.
  - Fuera de Docker devuelve 502 (`ENOTFOUND backend`).
  - `App.tsx:13` usa `VITE_API_BASE_URL` como alternativa.
  - Vite cambia de puerto si el 5173 está ocupado (C3).
- **R15 →** No escribir URLs `localhost` fijas en el código. Usar rutas relativas `/api/...` con `API_BASE_URL` y, fuera de Docker, configurar `VITE_API_BASE_URL`.

**F16. Dependencias sin fijar y debugger siempre activo.**
- *Evidencia:*
  - `backend/requirements.txt` no fija versiones.
  - El frontend sí tiene `package-lock.json`.
  - El CMD del backend siempre arranca `debugpy` en 5678 (`backend/Dockerfile:12`).
- **R16 →** No añadir dependencias sin necesidad. Si se añaden, hacerlo en `requirements.txt` o `package.json` + `package-lock.json` (con `npm install`). Usar `npm ci` para instalar sin tocar el lockfile.

**F17. Código muerto que confunde sobre el origen de los datos.**
- *Evidencia:* `src/lib/mock-data.ts` (datos de 2024) no se importa en ningún archivo.
- **R17 →** No usar `mock-data.ts` como fuente ni como referencia de fechas. La fuente es `/api/metrics`.

## Git

**F18. Historial con prefijos convencionales.**
- *Evidencia:* `feat:` (`eeece05`), `docs:` (`fb7dd96`), `chore:` (`9c3e480`), `Fix:` (`e267908`), junto a mensajes sin prefijo. El enunciado exige un commit por fase.
- **R18 →** Usar mensajes `tipo(ámbito): descripción` (`feat`, `fix`, `docs`, `test`, `chore`). Un commit por cambio lógico. Nunca mezclar fases ni cambios no relacionados.

## Mapa de reglas → archivos de `.agents/rules/`

| Archivo | Reglas |
|---|---|
| `backend-api.md` | R1, R2, R9, R10 |
| `api-contract.md` | R3 |
| `frontend-structure.md` | R4, R5, R6, R7, R8, R17 |
| `testing.md` | R2, R11, R12 |
| `runtime-and-config.md` | R15, R16 |
| `docs-and-git.md` | R13, R14, R18 |
