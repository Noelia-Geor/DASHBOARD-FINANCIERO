---
name: dashboard-pre-merge-check
description: Revisa una rama de este dashboard financiero antes de abrir un PR o fusionar con main. Úsala cuando pidan "revisar antes de fusionar", "QA antes del merge" o "¿está listo este PR?". NO sirve para escribir funcionalidades ni para desplegar.
---

# Revisión antes de fusionar (dashboard)

**Objetivo:** decidir si la rama actual puede abrir un PR contra `main`, usando las comprobaciones de este repo, y dar el resultado en una tabla. No arregles nada: solo informa.

## Entradas

- **Obligatoria:** una rama con commits por delante de `main` (`git log main..HEAD`). Si no hay ninguno, dilo y para.
- **Opcional:** la descripción del PR, para compararla con los cambios reales.

## Pasos

Si una comprobación no aplica (por ejemplo, no cambió nada en `backend/`), se marca **✅ n/a** con el motivo. Cada paso del 2 al 7 es una fila del informe.

1. Ejecuta `git diff --name-only main...HEAD` y agrupa los archivos en: `backend/`, `frontend/`, documentación (`README*.md`, `AGENTS.md`, `memory-bank/`, `.agents/rules/`, `.skills/`), skills instaladas (`.agents/skills/`, `skills-lock.json`) y otros.
   - Skills instaladas: cada carpeta de `.agents/skills/` debe estar en `skills-lock.json`, y al revés. Son textos de terceros: no revises su contenido aquí.
   - Otros: lístalos en el informe; no hacen fallar la revisión.
2. **Si cambió el frontend** → desde `frontend/` ejecuta `npm run lint`, `npm test -- --run` y `npm run build`.
   - Falla si algún comando termina con error.
   - Falla si `vite build` muestra "Some chunks are larger than 500 kB": los gráficos se cargan aparte desde el commit `perf(frontend)` (4b1eba3), así que ese aviso significa que algo pesado volvió al archivo principal.
3. **Si cambió el backend** → desde `backend/` ejecuta `python -m pytest`. Falla si algún test falla. Si pytest no está instalado, marca la fila ❓ "no ejecutado", nunca ✅.
4. **Contrato de la API** → si en `backend/app/routes.py` cambió un modelo de Pydantic, comprueba que `frontend/src/lib/financial-types.ts` cambió en la misma rama con los mismos nombres de campos y valores. El contrato está copiado a mano y nada más detecta si se desincroniza.
5. **Fechas** → si los cambios añaden código (no comentarios) que llama a `new Date(` con un `create_date` en `frontend/src/`, falla: hay que leer el texto ISO (`create_date.slice(0, 7)`). Ver el test de zona horaria en `financial-utils.test.ts`.
6. **Documentación** → si cambió un comando, puerto o variable de entorno (scripts de `package.json`, `vite.config.ts`, `docker-compose.yml`, Dockerfiles, `.env.example`), comprueba que `README.md` y `README.es.md` cambiaron juntos y que `memory-bank/progress.md` lo refleja.
7. **Commits** → cada commit de `main..HEAD` debe seguir `tipo(ámbito): descripción` o `tipo: descripción`, con un tipo de: `feat`, `fix`, `docs`, `test`, `chore`, `perf`.
8. Si te dieron la descripción del PR, añade una fila comparándola con los cambios reales. Si no, no pongas esa fila.
9. Escribe el informe.

## Salida

Una tabla en Markdown, una fila por comprobación, y después una línea con el veredicto:

| Comprobación | Resultado | Prueba |
|---|---|---|
| Frontend lint/test/build | ✅ | 9 tests pasan, sin aviso de tamaño |
| Backend pytest | ✅ n/a | no cambió nada en backend/ |
| … | … | … |

**Veredicto:** `LISTA` solo si todas las filas son ✅ o ✅ n/a. Si no, `NO LISTA`, con la lista de lo que hay que arreglar.

## Criterios de aceptación

- Cada fila cita la salida de un comando, un archivo o un hash de commit; no se supone nada.
- Una comprobación que no se pudo ejecutar es ❓, nunca ✅.
- Mientras se usa esta skill no se modifica ningún archivo del repo (`frontend/dist/` está en .gitignore y se permite).