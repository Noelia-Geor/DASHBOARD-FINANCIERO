# Estado y progreso

> Actualizado el 2026-10-05, tras las fases 1-4 y la verificación de Docker Compose en Codespaces.

## Qué funciona (verificado)

- El backend arranca con el comando del Dockerfile. `/health`, `/docs` y los 9 endpoints responden.
- El frontend muestra KPIs y gráficos con datos de la API cuando puede alcanzarla. En Docker lo hace mediante el proxy; fuera de Docker, con `VITE_API_BASE_URL`.
- La etiqueta de periodo refleja el rango real de los datos (antes estaba fija en "2024 - Full Year").
- Tests: backend 18 passed y frontend 8 passed. `npm run lint` y `npm run build` sin errores.
- El repo está listo para agentes:
  - `AGENTS.md` remite a `.agents/rules/` (6 reglas validadas con tareas reales) y a `memory-bank/`;
  - el rastro de verificación está en `verification.md` y los hallazgos en `findings.md`.

- `docker compose up --build`, verificado en un GitHub Codespace (`verification.md` §6):
  - build y contenedores OK;
  - tests dentro de los contenedores OK;
  - dashboard con datos a través del proxy de Vite.
  - En ese Codespace, el tráfico entre contenedores estaba bloqueado por `iptables-legacy` (`FORWARD DROP`) y hizo falta una regla temporal (C5).

## No verificado

- Si el bloqueo de red entre contenedores ocurre en todos los Codespaces o solo en el probado.
- `docker compose` en Docker Desktop (Windows/macOS).

## Gaps conocidos y deuda técnica

| Gap | Evidencia |
|---|---|
| 7 endpoints de métricas sin consumidor en la UI | `App.tsx` solo pide `/api/metrics` |
| Contrato backend↔frontend duplicado a mano, sin validación de la respuesta | `routes.py:11-27` frente a `financial-types.ts`; `response.json()` sin validar |
| `computeMonthlyData` agrupa con `new Date("YYYY-MM-DD")` + `getMonth()`, con riesgo en zonas al oeste de UTC | `financial-utils.ts`. No reproducido |
| `mock-data.ts` sin uso, pero compilado | ningún `import` |
| Mensaje de error en español y sin tilde en una UI en inglés | `App.tsx` ("informacion") |
| CORS abierto con credenciales | `main.py:7-13` |
| Dependencias de Python sin versión fijada; debugpy siempre activo | `requirements.txt`, `backend/Dockerfile` |
| Test con fechas fijas (solo comprueba la forma) | `test_metrics_comparison_returns_delta_fields` |
| Bundle mayor de 500 kB | aviso de `vite build` |
| Sin tests de componentes | solo existe `financial-utils.test.ts` |
| `.agents/skills/` no existe | `AGENTS.md` lo cita |

## Prioridades inmediatas

Derivadas de los gaps; no hay roadmap de producto en el repo.

1. Documentar para usuarios de Codespaces el síntoma `ETIMEDOUT` del proxy y su ajuste, si se reproduce en más Codespaces.
2. Antes de que la UI consuma más endpoints, decidir cómo mantener el contrato sincronizado (por ejemplo, tipos generados desde `/openapi.json`).
3. Corregir el agrupado por mes basado en texto ISO (ver `frontend-structure.md`) y añadir un test.
4. Decidir si `mock-data.ts` se elimina.
