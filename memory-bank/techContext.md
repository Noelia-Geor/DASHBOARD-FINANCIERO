# Contexto técnico

> Fuentes: `package.json` y `package-lock.json`, `backend/requirements.txt`, Dockerfiles, `docker-compose.yml` y configs.
> Las versiones resueltas se comprobaron el 2026-10-05.

## Stack

| Capa | Tecnología | Evidencia |
|---|---|---|
| Frontend | React 19.2.5 + TypeScript 6.0.2 | `frontend/package.json`, `package-lock.json` |
| Build / dev server | Vite 8.0.8 (`@vitejs/plugin-react` 6.0.1) | `frontend/vite.config.ts` |
| Estilos | Tailwind CSS 4.2.2 (`@tailwindcss/vite`) + primitivas shadcn (`card`, `skeleton`) | `frontend/components.json`, `src/components/ui/` |
| Gráficos e iconos | Recharts 3.8.1, lucide-react 1.8.0 | `package.json` |
| Tests frontend | Vitest 4.1.4 | script `test` |
| Lint | ESLint 9.39.4 + typescript-eslint + react-hooks + react-refresh | `frontend/eslint.config.js` |
| Backend | Python 3.13 (imagen `python:3.13-slim`), FastAPI, Uvicorn, Pydantic | `backend/Dockerfile`, `requirements.txt` |
| Depuración | debugpy (siempre activo, puerto 5678) | CMD de `backend/Dockerfile` |
| Tests backend | pytest + httpx (TestClient de FastAPI), pytest-cov | `requirements.txt`, `backend/tests/` |
| Orquestación | Docker Compose: servicios `frontend` (node:24-alpine) y `backend` | `docker-compose.yml` |

- `backend/requirements.txt` **no fija versiones**. El 2026-10-05 se resolvieron fastapi 0.142.2, uvicorn 0.54.0, pydantic 2.13.5 y pytest 9.1.1.
- **Base de datos:** ninguna. Los datos se generan en memoria.

## Configuración relevante

- `frontend/vite.config.ts`:
  - proxy `/api` → `http://backend:8000` (solo resuelve dentro de Docker);
  - `host: "0.0.0.0"`;
  - alias `@` → `./src`.
- `frontend/.env.example`: única variable, `VITE_API_BASE_URL`. Vacía en Docker; `http://localhost:8000` fuera de Docker. `App.tsx` la lee con `?? ""`.
- `backend/app/main.py`: CORS con `allow_origins=["*"]` y `allow_credentials=True`.
- `frontend/tsconfig.app.json`: incluye `src/` (también tests y `mock-data.ts`), con `noUnusedLocals` y `noUnusedParameters`.
- `.gitignore` excluye `node_modules`, `dist`, `.env`, `__pycache__` y entornos virtuales.

## Puertos

| Puerto | Servicio |
|---|---|
| 5173 | Frontend (Vite). Fuera de Docker usar `--strictPort` |
| 8000 | API FastAPI; `/docs` y `/openapi.json` |
| 5678 | debugpy |

## Comandos

| Acción | Comando |
|---|---|
| Levantar todo | `docker compose up --build` ✅ (Codespaces; ver C5 en `verification.md` si el proxy da `ETIMEDOUT`) |
| Backend sin Docker (desde `backend/`) | `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` ✅ |
| Frontend sin Docker (desde `frontend/`, bash) | `npm ci` y `VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort` ✅ |
| Frontend sin Docker (PowerShell) | `$env:VITE_API_BASE_URL='http://localhost:8000'; npm run dev -- --host 0.0.0.0 --port 5173 --strictPort` |
| Tests backend | `cd backend && python -m pytest` ✅ |
| Tests / lint / build frontend | `npm test`, `npm run lint`, `npm run build` ✅ |
