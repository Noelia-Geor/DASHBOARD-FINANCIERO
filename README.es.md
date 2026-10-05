# Panel de Métricas

<!-- hide -->

Por [@marcogonzalo](https://github.com/marcogonzalo) y [otros contribuidores](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) en [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_These instructions are [available in English](./README.md)._

**Antes de empezar**: 📗 [Lee las instrucciones](https://4geeks.com/es/lesson/como-comenzar-un-proyecto-de-codificacion) sobre cómo comenzar un proyecto de programación.

<!-- endhide -->

---

_Dashboard de métricas financieras con frontend en React + TypeScript y backend en FastAPI._

## Pasos recomendados

1. Haz un fork de este repositorio a tu cuenta.
2. Abre tu fork en GitHub Codespaces o clónalo y ejecútalo en tu entorno local.
3. Ejecuta tu agente de IA para inspeccionar frontend y backend.
4. Documenta las reglas propuestas y el banco de memoria en tu fork.
5. Ajusta y valida las reglas hasta que sean aplicables al flujo real del proyecto.

## Estructura esperada del directorio para agentes

```text
./.agents
└─ /rules
   └─ <nombre-regla>.md
└─ /skills
   └─ /<nombre-skill>
      └─ /SKILL.md
```

## Cómo ejecutar en local

### Con Docker (recomendado)

```bash
docker compose up --build
```

Dentro de Docker Compose, el frontend usa el proxy de Vite para `/api` (destino `http://backend:8000`), así que no necesitas variables de entorno extra.
Si necesitas apuntar a otro backend, copia `frontend/.env.example` como `.env` y define `VITE_API_BASE_URL`.

Puertos expuestos (`docker-compose.yml`):

| Puerto | Servicio | URL / uso |
|---|---|---|
| 5173 | Frontend (servidor de desarrollo de Vite) | http://localhost:5173 |
| 8000 | Backend (FastAPI + Uvicorn) | http://localhost:8000 |
| 8000 | Documentación API | http://localhost:8000/docs |
| 5678 | Depurador del backend (debugpy) | conecta un depurador de Python a `localhost:5678` |

El backend siempre arranca bajo debugpy escuchando en `0.0.0.0:5678` (`backend/Dockerfile`), así que el puerto 5678 está abierto mientras el backend esté en marcha.

### Sin Docker

Versiones de referencia: Python 3.13 (`backend/Dockerfile`) y Node 24 (`frontend/Dockerfile`).

**Backend** (desde `backend/`, idealmente dentro de un entorno virtual):

```bash
pip install -r requirements.txt
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Es el mismo comando que el `CMD` de `backend/Dockerfile`, así que también abre el puerto 5678 para el depurador.

**Frontend** (desde `frontend/`, en una segunda terminal). La forma de definir la variable de entorno depende de tu shell:

bash / zsh (macOS, Linux, Git Bash):

```bash
npm ci
VITE_API_BASE_URL=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

PowerShell (Windows):

```powershell
npm ci
$env:VITE_API_BASE_URL='http://localhost:8000'; npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

- La forma de bash `VITE_API_BASE_URL=... npm run dev` no funciona en PowerShell (falla con "El término 'VITE_API_BASE_URL=http://localhost:8000' no se reconoce como nombre de un cmdlet..."). En PowerShell la variable dura lo que la sesión de la terminal; abre una terminal nueva o ejecuta `Remove-Item Env:VITE_API_BASE_URL` para quitarla.
- `VITE_API_BASE_URL` es **obligatoria** fuera de Docker: el proxy de Vite apunta a `http://backend:8000`, un nombre que solo existe dentro de Docker Compose. Sin ella, las peticiones a `/api` devuelven 502 (`ENOTFOUND backend`) y el dashboard no muestra datos. También puedes copiar `frontend/.env.example` como `frontend/.env` y poner ahí el mismo valor.
- `--strictPort` hace que Vite falle si el 5173 está ocupado, en lugar de cambiarse sin avisar a otro puerto (por ejemplo, 5174). Sin esa opción, comprueba la URL que imprime Vite.

**Comprueba que funciona:** `http://localhost:8000/health` devuelve `{"status":"ok"}` y `http://localhost:5173/` muestra el dashboard con datos.

## Cómo ejecutar las pruebas

**Backend** (`pytest`). Ejecútalo desde `backend/`, porque `tests/conftest.py` añade esa carpeta a la ruta de importación:

```bash
cd backend
python -m pytest
```

**Frontend** (`vitest`, más el lint y la comprobación de tipos que se hace en el build):

```bash
cd frontend
npm test          # vitest run
npm run lint      # eslint .
npm run build     # tsc -b && vite build
```

Otros scripts disponibles: `npm run test:watch` (modo observación) y `npm run test:coverage` (informe de cobertura).

Avisos conocidos que no indican fallo: una advertencia de deprecación de Starlette sobre `httpx` en `pytest` y un aviso de "chunk mayor de 500 kB" en `npm run build`.

---

Este y muchos otros proyectos son construidos por estudiantes como parte de los [Coding Bootcamps](https://4geeksacademy.com/) de 4Geeks Academy. Encuentra más acerca de los [cursos](https://4geeksacademy.com/es/comparar-programas) de [Ingeniería de IA](https://4geeksacademy.com/es/coding-bootcamps/ingenieria-ia), [Data Science & Machine Learning](https://4geeksacademy.com/es/coding-bootcamps/curso-datascience-machine-learning), [Ciberseguridad](https://4geeksacademy.com/es/coding-bootcamps/curso-ciberseguridad) y [Full-Stack Software Developer con IA](https://4geeksacademy.com/es/coding-bootcamps/programador-full-stack).
