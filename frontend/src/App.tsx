import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import {
  computeKPIs,
  computeMonthlyData,
  formatPeriodLabel,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

const LazyIncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((mod) => ({
    default: mod.IncomeOutcomeChart,
  })),
);

const LazyProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((mod) => ({
    default: mod.ProfitPercentChart,
  })),
);

function App() {
  const [movements, setMovements] = useState<FinancialMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metrics = useMemo<KPIMetrics | null>(
    () => (movements ? computeKPIs(movements) : null),
    [movements],
  );
  const monthlyData = useMemo<MonthlyDataPoint[]>(
    () => (movements ? computeMonthlyData(movements) : []),
    [movements],
  );
  const period = useMemo<string | null>(
    () => (movements ? formatPeriodLabel(movements) : null),
    [movements],
  );

  useEffect(() => {
    fetchFinancialData()
      .then((data) => {
        setMovements(data);
      })
      .catch(() => {
        setError(
          "Could not load financial data. Check that the backend API is running.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const chartFallback = (
    <Card className="border-border/60">
      <CardContent className="flex h-[280px] items-center justify-center p-0">
        <Skeleton className="h-full w-full rounded-lg" />
      </CardContent>
    </Card>
  );

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} loading={loading} />

          {error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <h2 className="sr-only">Key performance indicators</h2>
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <h2 className="sr-only">Financial charts</h2>
            <Suspense fallback={chartFallback}>
              <LazyIncomeOutcomeChart data={monthlyData} loading={loading} />
            </Suspense>
            <Suspense fallback={chartFallback}>
              <LazyProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
