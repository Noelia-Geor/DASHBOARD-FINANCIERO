---
description: Documentación bilingüe verificada y mensajes de commit
globs: ["README.md", "README.es.md", "AGENTS.md", "verification.md", "findings.md", "memory-bank/**", ".agents/**"]
alwaysApply: true
---

# Documentación y Git

**Nombre:** Documentar solo lo comprobado y commitear en unidades lógicas

**Alcance:** READMEs, `AGENTS.md`, `memory-bank/`, `.agents/` y mensajes de commit

**Justificación:**
- `README.md` y `README.es.md` se mantienen en paralelo (`cbd20dc`, `eeece05` cambian ambos).
- La documentación de ejecución tenía huecos (puerto 5678, proxy solo en Docker).
- El historial usa prefijos convencionales (`feat:`, `docs:`, `chore:`). (findings F13, F14, F18)

## Guía específica del proyecto

- **READMEs en paralelo:** todo cambio de uso (comandos, puertos, variables, pasos) se escribe en `README.md` (inglés) y `README.es.md` (español) en el mismo commit, con la misma estructura de secciones.
- **Solo hechos comprobados:** cada comando, puerto o URL documentado debe salir de `docker-compose.yml`, un Dockerfile, `package.json`, `vite.config.ts` o una ejecución real. Si no se ha podido comprobar, se marca como "sin verificar" (❓), igual que en `verification.md`.
- **Memoria del proyecto:** si una tarea cambia stack, endpoints, comandos o estado, actualizar el archivo correspondiente de `memory-bank/` en la misma tarea.
- **Carpetas de `AGENTS.md`:** las fuentes de contexto son `.agents/rules/` y `memory-bank/`. `.agents/skills/` contiene skills instaladas de terceros (accessibility, tdd, vercel-react-best-practices). `.skills/` contiene skills internas del proyecto (dashboard-pre-merge-check).
- **Comandos multiplataforma:** si un comando cambia entre bash y PowerShell (por ejemplo, variables de entorno), documentar las dos formas o indicar la shell.
- **Instrucciones de la tarea:** si quien encarga la tarea dice que no se haga commit, se deja el cambio sin commitear. Las reglas de commit aplican cuando sí se commitea.
- **Commits:**
  - Formato `tipo(ámbito opcional): descripción en imperativo`.
  - Tipos usados en este repo: `feat`, `fix`, `docs`, `test`, `chore`, `perf`.
  - Un cambio lógico por commit; no mezclar refactors ni formato con la tarea.
  - No commitear `node_modules/`, `dist/`, `__pycache__/` ni `.env` (cubiertos por `.gitignore`).
- **No reescribir historia** publicada (`reset`, `rebase`, `push --force`) salvo petición explícita.

## Comprobación

- `git diff` del README en inglés y en español muestra el mismo cambio.
- `git log --oneline` respeta el formato.
