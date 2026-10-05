# Contexto de producto

> Solo describe lo que hace el código hoy. No contiene roadmap: no hay ningún documento de producto en el repo que lo respalde.
> Verificado el 2026-10-05 ejecutando la app (ver `verification.md`).

## Qué es

Un dashboard web de métricas financieras de una empresa ficticia (`README.md`: "Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend").

Es el proyecto de práctica de 4Geeks Academy *"Construyendo contexto desde un proyecto existente"*. El objetivo del repo es dejarlo listo para agentes, no ampliar el producto.

## Qué ve el usuario (`http://localhost:5173/`)

| Elemento | Fuente en código | Qué muestra |
|---|---|---|
| Encabezado "Financial Overview" + etiqueta de periodo | `components/dashboard/dashboard-header.tsx`, `formatPeriodLabel` | El rango de meses de los datos cargados, por ejemplo "Oct 2025 - Sep 2026" |
| 4 KPIs | `kpi-row.tsx`, `kpi-card.tsx`, `computeKPIs` | Total Income, Total Outcome, Profit y Profit Margin (%) del conjunto completo |
| Gráfico "Income vs. Outcome" | `income-outcome-chart.tsx`, `computeMonthlyData` | Ingresos y gastos por mes (líneas, Recharts) |
| Gráfico "Profit Margin %" | `profit-percent-chart.tsx` | Margen mensual en % |
| Estados | `kpi-card.tsx`, gráficos, `App.tsx` | `Skeleton` al cargar; "No data available to display" si no hay datos; aviso "No se pudo cargar la informacion financiera..." si falla la API |

- La UI está en inglés y formatea en `en-US` / USD.
- No hay filtros, navegación, login ni edición: es una sola pantalla de solo lectura.

## Datos

- No son reales. El backend genera 360 movimientos simulados por petición (`generate_mock_movements(seed=42)`, `backend/app/routes.py`): 30 por mes durante los últimos 12 meses respecto a la fecha actual.
- Cada movimiento tiene `create_date`, `amount`, `operation_type` (`income` | `outcome`), `category` (`suppliers`, `sales`, `operational`, `administrative`, `others`) y `business_type` (`B2B` | `B2C`).

## Capacidades de la API sin uso en la UI

El backend ya ofrece, con tests, estas capacidades que el frontend no consume:
- filtros (`category`, `operation_type`, fechas);
- facets;
- resúmenes por día/semana/mes;
- top de categorías;
- comparación con el periodo anterior;
- alertas de picos de gasto;
- vistas B2B y B2C.

Ver `systemPatterns.md`.
