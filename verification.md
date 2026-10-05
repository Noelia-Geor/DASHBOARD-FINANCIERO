# Verificación del handover

Rastro de verificación del repositorio heredado. Cada afirmación se contrastó con archivos reales y, cuando era posible, ejecutando los servicios.

- **Fecha:** 2026-10-05
- **Entorno:** Windows 11, Node 24.14.0, Python 3.13.14 (venv fuera del repo).
- **Limitación:** Docker no está instalado en esta máquina, así que `docker compose up --build` no se pudo ejecutar aquí. Los servicios se levantaron con los mismos comandos que definen los Dockerfiles.

Marcas: ✅ verificado · ❌ incorrecto (con corrección) · ❓ sin verificar

## 1. Instrucciones de ejecución

### Con Docker (método documentado)

```bash
docker compose up --build
```

Evidencia: `README.md`, `README.es.md` y `docker-compose.yml`.

| Servicio | Build | Puertos publicados | Comando |
|---|---|---|---|
| `frontend` | `frontend/Dockerfile` (`node:24-alpine`, `npm install`) | `5173:5173` | `npm run dev -- --host 0.0.0.0 --port 5173` |
| `backend` | `backend/Dockerfile` (`python:3.13-slim`, `pip install -r requirements.txt`) | `8000:8000` y `5678:5678` | `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` |

- El frontend depende del backend (`depends_on`).
- Ambos montan su carpeta como volumen; el frontend además usa un volumen anónimo para `/app/node_modules`.

### Sin Docker (lo que se ejecutó en esta verificación)

```bash
# backend (desde backend/)
pip install -r requirements.txt
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# frontend (desde frontend/)
npm ci
VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Fuera de Docker es **obligatorio** pasar `VITE_API_BASE_URL`. El motivo está en la corrección C1.

### Cómo comprobar que están sanos

| Comprobación | Resultado observado |
|---|---|
| `GET http://localhost:8000/health` | `{"status":"ok"}` (HTTP 200) |
| `GET http://localhost:8000/docs` | HTTP 200, Swagger UI |
| `GET http://localhost:8000/openapi.json` | título `Financial Metrics API`, 9 rutas `GET` |
| `GET http://localhost:8000/api/metrics` | 360 movimientos, de `2025-10-02` a `2026-09-28` |
| `http://localhost:5173/` | Dashboard con 4 KPIs y 2 gráficos; el navegador llama a `http://localhost:8000/api/metrics` (200) |
| Puertos en escucha | 5173, 8000 y 5678 (debugpy) |

### Pruebas

| Comando | Dónde | Resultado |
|---|---|---|
| `python -m pytest` | `backend/` | 15 passed (1 warning de deprecación de Starlette) |
| `npm test` (`vitest run`) | `frontend/` | 5 passed |
| `npm run lint` (`eslint .`) | `frontend/` | sin errores |
| `npm run build` (`tsc -b && vite build`) | `frontend/` | OK, con aviso de chunk mayor de 500 kB |

## 2. Resumen del proyecto

Dashboard de métricas financieras con dos servicios:

- **Backend:** FastAPI (`backend/app/main.py`, `backend/app/routes.py`).
  - No hay base de datos: cada petición genera 360 movimientos simulados con `generate_mock_movements(seed=42)` (`routes.py:94-104`).
  - Hay 30 movimientos por mes y las fechas son relativas a hoy: los últimos 12 meses (`_year_for_month`, `routes.py:65-68`).
  - Expone 9 endpoints `GET`, todos en `routes.py`: `/health`, `/api/metrics`, `/api/metrics/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b` y `/b2c`.
- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind 4 + Recharts (`frontend/package.json`).
  - `App.tsx` hace un solo `fetch` a `${VITE_API_BASE_URL ?? ""}/api/metrics` (`App.tsx:13-21`).
  - Calcula los KPIs y las series mensuales en el cliente (`src/lib/financial-utils.ts`).
  - Pinta las KPIs con `components/dashboard/*` y los gráficos con Recharts.
- **Conexión:**
  - En Docker, Vite hace de proxy de `/api` hacia `http://backend:8000` (`vite.config.ts:11-16`).
  - Fuera de Docker se usa `VITE_API_BASE_URL` (`frontend/.env.example`).
  - CORS está abierto a cualquier origen (`main.py:7-13`).

## 3. Rastro de verificación

| # | Afirmación | Fuente | Estado |
|---|---|---|---|
| 1 | Se ejecuta con `docker compose up --build` | `README.md`, `docker-compose.yml` | ❓ no ejecutado: no hay Docker en esta máquina |
| 2 | Frontend en `http://localhost:5173` | `docker-compose.yml:7`, `frontend/Dockerfile:12` | ✅ en ejecución nativa con `--strictPort` |
| 3 | Backend en `http://localhost:8000`, docs en `/docs` | `docker-compose.yml:19`, `backend/Dockerfile:12` | ✅ HTTP 200 |
| 4 | El backend expone también el puerto 5678 | `docker-compose.yml:20`, `backend/Dockerfile:10-12` | ✅ debugpy escuchando. El README no lo menciona |
| 5 | Stack frontend: React + TypeScript | `README.md`, `frontend/package.json` | ✅ React 19, TS ~6.0, Vite 8 |
| 6 | Stack backend: FastAPI | `backend/app/main.py:1,6` | ✅ (`requirements.txt` sin versiones fijadas) |
| 7 | Los datos vienen de una base de datos | — | ❌ No hay BD: datos simulados en memoria con semilla 42 (`routes.py:94-104`) |
| 8 | El frontend usa todos los endpoints | — | ❌ Solo usa `/api/metrics` (`App.tsx:16`); los otros 7 endpoints de métricas no tienen consumidor en `src/` |
| 9 | "No necesitas variables de entorno extra en desarrollo local" | `README.md`, `README.es.md` | ❌ Ver C1 |
| 10 | El dashboard muestra el año 2024 | `App.tsx:49`, `dashboard-header.tsx:7` | ❌ Ver C2 |
| 11 | `AGENTS.md` remite a `.agents/rules`, `.agents/skills` y `memory-bank` | `AGENTS.md` | ✅ remite, pero en el handover **ninguna de las tres existía** |
| 12 | `src/lib/mock-data.ts` alimenta el dashboard | — | ❌ No se importa en ningún archivo; los datos reales llegan por la API |
| 13 | Hay tests de backend y frontend | `backend/tests/`, `frontend/src/lib/financial-utils.test.ts` | ✅ 15 + 5 pasan. Los READMEs no explican cómo ejecutarlos |
| 14 | Los títulos de los READMEs coinciden | `README.md` ("Financial Metrics Dashboard"), `README.es.md` ("Panel de Métricas") | ❌ El título en español se cambió en el commit de prueba `1f38829` y ya no traduce al inglés |
| 15 | `docker compose` funciona en Codespaces | `README.md` | ❓ no probado |

## 4. Correcciones (afirmación incorrecta → corrección)

- **C1. Proxy de Vite.** "El proxy de Vite hace que no haga falta configurar nada en local."
  - Ejecutando sin Docker, `GET http://localhost:5173/api/metrics` devolvió **502** y Vite registró `Error: getaddrinfo ENOTFOUND backend`.
  - El destino `http://backend:8000` (`vite.config.ts:13`) solo resuelve dentro de la red de Docker Compose.
  - **Corrección:** fuera de Docker hay que definir `VITE_API_BASE_URL=http://localhost:8000`. Con esa variable, el dashboard cargó los datos (200).
- **C2. Periodo mostrado.** "El dashboard muestra 2024 - Full Year."
  - La etiqueta está fijada en `App.tsx:49`.
  - La API devolvió datos de `2025-10-02` a `2026-09-28` y los gráficos muestran de *Nov 2025* a *Sep 2026*.
  - **Corrección:** la etiqueta no refleja los datos.
- **C3. Puerto del frontend.** "El frontend siempre está en el 5173."
  - Al relanzar Vite con un proceso anterior ocupando el 5173, arrancó en **5174** sin fallar ("Port 5173 is in use, trying another one...").
  - **Corrección:** el puerto 5173 solo está garantizado si se usa `--strictPort` o el mapeo de Docker. Hay que confirmar la URL en la salida de Vite.
- **C4. Origen de los datos.** "El dashboard lee `mock-data.ts`."
  - Falso: `grep` no encuentra ninguna importación de `mock-data`.
  - **Corrección:** los datos vienen de `GET /api/metrics`.

## 5. Validación de las reglas de `.agents/rules` (Fase 3)

**Método:**
- Cada prueba la hizo un agente nuevo, sin contexto previo, al que solo se le indicó "lee `AGENTS.md`" y una tarea pequeña real, sin mencionar las convenciones.
- Se revisó el diff de cada agente, se ejecutaron las suites y se iteraron las reglas con los huecos detectados.

### Ronda 1

| Tarea real | Reglas ejercitadas | Qué hizo el agente guiado por las reglas | Resultado |
|---|---|---|---|
| T1. La etiqueta de periodo muestra "2024" pero los datos son de otros meses | `frontend-structure`, `testing`, `api-contract` | Consultó `/api/metrics` antes de programar. Creó la función pura `formatPeriodLabel` en `financial-utils.ts` con 3 tests. Añadió `loading` + `Skeleton` al header. Respetó el estilo de cada archivo. Texto en inglés. No usó `mock-data.ts` | ✅ vitest 8/8, lint y build OK. En el navegador: "Oct 2025 - Sep 2026" |
| T2. Cubrir con tests el rechazo de `limit` fuera de rango en `/categories/top` | `backend-api`, `testing` | 3 tests en `test_routes.py` con el `client` existente. Comprobó el 422 de FastAPI sin tocar el endpoint, sin fechas fijas, y ejecutó pytest desde `backend/` | ✅ pytest 18/18 |
| T3. Documentar cómo ejecutar pruebas y arrancar sin Docker | `docs-and-git`, `runtime-and-config`, `testing` | Cambió `README.md` y `README.es.md` en paralelo. Documentó solo lo comprobado con `curl`/`netstat`. Añadió el puerto 5678. Corrigió la frase falsa del proxy | ✅ |
| T4. Plan (sin cambios) para añadir una descripción a cada movimiento | `api-contract`, `backend-api` | Cambio en los dos lados en `snake_case`, tests nuevos en `test_routes.py`. Detectó que una llamada extra a `random` alteraría la semilla 42 | ✅ plan correcto |

**Huecos detectados → corrección aplicada a las reglas:**
- `testing.md` fijaba recuentos de tests (15/5), desfasados tras T2 → se eliminan los recuentos.
- `test_metrics_comparison_returns_delta_fields` usa fechas fijas, contra la regla → se documenta como excepción heredada que no se debe copiar.
- Los objetos escritos a mano (`financial-utils.test.ts`, y `mock-data.ts`, que también compila `tsc -b`) rompen el build si cambia el contrato (T4) → `api-contract.md` los enumera y prohíbe borrarlos o hacer el campo opcional solo en TS para esquivar el error.
- Un campo derivado no debe llamar a `random` (T4) → regla añadida en `backend-api.md` y `api-contract.md`.
- La sintaxis `VAR=valor cmd` no funciona en PowerShell (T3) → variante PowerShell en `runtime-and-config.md` y regla de "comandos multiplataforma" en `docs-and-git.md`.
- `.agents/skills/` no existe y las reglas no lo decían (T1–T4) → `docs-and-git.md` lo aclara.
- "Commitear" contra "la tarea dice no commitear" (T1, T3) → `docs-and-git.md`: manda la instrucción de la tarea.
- Fechas ISO con `new Date()` + `getMonth()` (riesgo de zona horaria señalado en T1) → `frontend-structure.md` pide trabajar con el texto en código nuevo.

### Ronda 2 (reglas iteradas)

| Tarea real | Qué hizo el agente | Resultado |
|---|---|---|
| T5. "Una compañera en Windows/PowerShell no consigue arrancar el frontend sin Docker" | Aplicó la nueva regla multiplataforma: bloques bash y PowerShell en los dos READMEs, con el comando literal de `runtime-and-config.md`. Reprodujo el error en PowerShell y verificó que la variable llega a Vite (`loadEnv`) | ✅ |

**Hueco residual detectado en la ronda 2:** el comentario de `frontend/.env.example` repetía "el proxy ya reenvía /api en desarrollo local". Se corrige en esta fase, igual que C1.

### Estado tras la Fase 3

| Comprobación | Resultado |
|---|---|
| backend `python -m pytest` | 18 passed |
| frontend `npm test` | 8 passed |
| `npm run lint` | sin errores |
| `npm run build` | OK |
