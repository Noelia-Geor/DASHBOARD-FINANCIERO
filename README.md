# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run locally

### With Docker (recommended)

```bash
docker compose up --build
```

Inside Docker Compose, the frontend uses the Vite proxy for `/api` (target `http://backend:8000`), so no extra environment variables are required.
If you need to target a different backend origin, copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL`.

Exposed ports (`docker-compose.yml`):

| Port | Service | URL / use |
|---|---|---|
| 5173 | Frontend (Vite dev server) | http://localhost:5173 |
| 8000 | Backend (FastAPI + Uvicorn) | http://localhost:8000 |
| 8000 | API documentation | http://localhost:8000/docs |
| 5678 | Backend debugger (debugpy) | attach a Python debugger to `localhost:5678` |

The backend always starts under debugpy listening on `0.0.0.0:5678` (`backend/Dockerfile`), so port 5678 is open whenever the backend is running.

### Without Docker

Reference runtime versions: Python 3.13 (`backend/Dockerfile`) and Node 24 (`frontend/Dockerfile`).

**Backend** (from `backend/`, ideally inside a virtual environment):

```bash
pip install -r requirements.txt
python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

This is the same command as the `backend/Dockerfile` `CMD`, so it also opens port 5678 for the debugger.

**Frontend** (from `frontend/`, in a second terminal). The way to set the environment variable depends on your shell:

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

- The bash form `VITE_API_BASE_URL=... npm run dev` does not work in PowerShell (PowerShell treats `VITE_API_BASE_URL=http://localhost:8000` as a command name and reports that it is not recognized). In PowerShell the variable lasts for the current terminal session; open a new terminal or run `Remove-Item Env:VITE_API_BASE_URL` to clear it.
- `VITE_API_BASE_URL` is **required** outside Docker: the Vite proxy points to `http://backend:8000`, a hostname that only exists inside Docker Compose. Without it, `/api` requests return 502 (`ENOTFOUND backend`) and the dashboard shows no data. Alternatively, copy `frontend/.env.example` to `frontend/.env` and set the same value there.
- `--strictPort` makes Vite fail if 5173 is busy instead of silently switching to another port (e.g. 5174). Without it, check the URL Vite prints.

**Check that it works:** `http://localhost:8000/health` returns `{"status":"ok"}` and `http://localhost:5173/` shows the dashboard with data.

## How to run the tests

**Backend** (`pytest`). Run it from `backend/`, because `tests/conftest.py` adds that folder to the import path:

```bash
cd backend
python -m pytest
```

**Frontend** (`vitest`, plus lint and the type check that runs as part of the build):

```bash
cd frontend
npm test          # vitest run
npm run lint      # eslint .
npm run build     # tsc -b && vite build
```

Other available scripts: `npm run test:watch` (watch mode) and `npm run test:coverage` (coverage report).

Known warnings that do not mean a failure: a Starlette deprecation warning about `httpx` in `pytest`, and a "chunk larger than 500 kB" notice in `npm run build`.

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
