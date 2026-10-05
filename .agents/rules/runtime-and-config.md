---
description: Cómo levantar los servicios, puertos reales, URLs de API y dependencias
globs: ["docker-compose.yml", "**/Dockerfile", "frontend/vite.config.ts", "frontend/.env.example", "frontend/package.json", "backend/requirements.txt", "frontend/src/App.tsx"]
alwaysApply: false
---

# Ejecución y configuración

**Nombre:** Puertos y URLs solo desde la evidencia del repo

**Alcance:** Docker Compose, Dockerfiles, configuración de Vite, variables de entorno y dependencias

**Justificación:**
- El proxy de Vite apunta a `http://backend:8000` (`vite.config.ts:13`), que solo resuelve dentro de Docker. Ejecutando sin Docker dio 502 `ENOTFOUND backend`.
- Vite cambia de puerto si el 5173 está ocupado.
- El backend expone también debugpy en 5678. (findings F15, F16; `verification.md` C1 y C3)

## Guía específica del proyecto

- **Método soportado:** `docker compose up --build` desde la raíz.
  - Frontend → `5173`, backend → `8000`, docs → `http://localhost:8000/docs`, debugpy → `5678` (`docker-compose.yml`).
- **Sin Docker:** backend con el CMD de `backend/Dockerfile`; frontend con `VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`.
  - Sin la variable, `/api` falla.
  - Sin `--strictPort`, el puerto puede ser otro.
  - La sintaxis `VAR=valor comando` es de bash/zsh. En **PowerShell**:
    ```powershell
    $env:VITE_API_BASE_URL='http://localhost:8000'; npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
    ```
    La variable dura lo que la sesión de la terminal.
- **URLs en el código:** nunca escribir `http://localhost:...` fijo. Las llamadas usan `` `${API_BASE_URL}/api/...` `` con `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""` (al inicio de `App.tsx`).
- **Variables de entorno:** solo `VITE_API_BASE_URL`, documentada en `frontend/.env.example`. No commitear `.env` (lo ignora `.gitignore`).
- **Puertos:** no inventarlos ni cambiar los mapeos de `docker-compose.yml` sin pedirlo. Antes de afirmar una URL, confirmarla en la salida del servicio o en `/health`.
- **Dependencias:**
  - Frontend: `npm ci` para instalar (respeta `package-lock.json`). `npm install <paquete>` solo si la tarea exige una dependencia nueva, y commitear `package.json` y `package-lock.json` juntos.
  - Backend: añadir a `backend/requirements.txt`. Hoy no hay versiones fijadas; no cambiar eso sin pedirlo.
  - Versiones de runtime de referencia: Node 24 (`frontend/Dockerfile`) y Python 3.13 (`backend/Dockerfile`).
- **Salud de los servicios:** `GET /health` → `{"status":"ok"}`, y `http://localhost:5173/` muestra datos (no el aviso "No se pudo cargar...").

## Comprobación

Cualquier puerto, URL o comando que menciones aparece en `docker-compose.yml`, un Dockerfile, `package.json` o `vite.config.ts`, o lo observaste en la salida real.
