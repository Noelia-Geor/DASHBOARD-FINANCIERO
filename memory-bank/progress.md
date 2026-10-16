# Estado y progreso

> Actualizado el 2026-10-07, tras las fases 1-4, la verificación de Docker Compose en Codespaces y la rama `feature/agent-skills`.

## Qué funciona (verificado)

- El backend arranca con el comando del Dockerfile. `/health`, `/docs` y los 9 endpoints responden.
- El frontend muestra KPIs y gráficos con datos de la API cuando puede alcanzarla. En Docker lo hace mediante el proxy; fuera de Docker, con `VITE_API_BASE_URL`.
- La etiqueta de periodo refleja el rango real de los datos (antes estaba fija en "2024 - Full Year").
- Tests: backend 18 passed y frontend 9 passed. `npm run lint` y `npm run build` sin errores.
- El repo está listo para agentes:
  - `AGENTS.md` remite a `.agents/rules/` (6 reglas validadas con tareas reales), a `.agents/skills/` (skills de terceros) y a `memory-bank/`;
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
| `mock-data.ts` sin uso, pero compilado | ningún `import` |
| Mensaje de error en español y sin tilde en una UI en inglés | `App.tsx` ("informacion") |
| CORS abierto con credenciales | `main.py:7-13` |
| Dependencias de Python sin versión fijada; debugpy siempre activo | `requirements.txt`, `backend/Dockerfile` |
| Test con fechas fijas (solo comprueba la forma) | `test_metrics_comparison_returns_delta_fields` |
| Sin tests de componentes | solo existe `financial-utils.test.ts` |

## Skills de agente

La rama `feature/agent-skills` (7 commits sobre `origin/main`) instaló skills de terceros, aplicó sus recomendaciones y creó una skill interna de pre-merge.

### Skills instaladas (`.agents/skills/`)

| Skill | Origen | Incluida en |
|---|---|---|
| `accessibility` | `addyosmani/web-quality-skills` | `e66f9ac` |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | `e66f9ac` |
| `tdd` | `mattpocock/skills` | `8414a66` |

**Por qué se eligió `tdd`**: se buscaron skills de testing/vitest. `mattpocock/skills@tdd` tiene 1 M de instalaciones (frente a 39 K de `antfu/skills@vitest`) y clasifica Safe/Low Risk, y Vitest ya está configurado en el proyecto. (`8414a66`)

### Qué se aplicó

| Skill | Commit | Aplicado | Rechazado |
|---|---|---|---|
| `accessibility` | `280c038` | Hallazgos 1,3,5,6,9,10,11,14: título de página, `role=alert`, foco visible con `--ring`, jerarquía h2/h3, títulos y descripción de gráficos, tablas `sr-only`, animación condicional con `prefers-reduced-motion`. | Hallazgos 4,13 (el modo claro no se renderiza, `<main>` siempre es `.dark`), 7,8 (`lucide-react` ya pone `aria-hidden`), 2,12,15 (no aplican). |
| `vercel-react-best-practices` | `4b1eba3` | `js-combine-iterations` (un solo `reduce` en `computeKPIs`), `bundle-dynamic-imports` (`React.lazy` + `Suspense` para gráficos Recharts; el *entry chunk* baja de 586 kB a 188 kB, desaparece el aviso de >500 kB), `rerender-derived-state-no-effect` (`useMemo` para `metrics`, `monthlyData` y `period`). | Hallazgos 2‑6 de Copilot (sin ganancia real o regla incorrecta). |
| `tdd` | `6d7a14f` | TDD *red‑green*: test con `vi.stubEnv('TZ', 'America/New_York')` que pilla el bug de zona horaria; arreglo con `create_date.slice(0, 7)` en vez de `new Date(m.create_date)` + `getMonth()`. | — |

### Skill interna (`.skills/`)

| Skill | Commit | Propósito |
|---|---|---|
| `dashboard-pre-merge-check` | `dd3e87e`, `17ed8c4` | Checklist pre-merge (lint/test/build, tamaño de chunk, contrato API, fechas ISO, documentación, formato de commits). |

**Fallo encontrado al probarla**: la primera versión (`dd3e87e`) comparaba contra `main` local. En una sesión limpia la `main` local estaba en `954f812` (12 commits de diferencia), por lo que revisó commits que no eran de la rama y devolvió un falso **LISTA**. Se arregló en `17ed8c4` añadiendo `git fetch origin` y comparando contra `origin/main`.

### Gaps resueltos

- `.agents/skills/` ya existe con 3 skills (accessibility, tdd, vercel-react-best-practices).
- El bug de zona horaria en `computeMonthlyData` está corregido con el test TZ (`financial-utils.test.ts`).
- El bundle ya no supera 500 kB (el *entry chunk* bajó de 586 kB a 188 kB).

## Prioridades inmediatas

Derivadas de los gaps; no hay roadmap de producto en el repo.

1. Documentar para usuarios de Codespaces el síntoma `ETIMEDOUT` del proxy y su ajuste, si se reproduce en más Codespaces.
2. Antes de que la UI consuma más endpoints, decidir cómo mantener el contrato sincronizado (por ejemplo, tipos generados desde `/openapi.json`).
3. Decidir si `mock-data.ts` se elimina.
