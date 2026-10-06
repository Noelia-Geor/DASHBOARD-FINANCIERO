// ---------------------------------------------------------------------------
// API parameter types — mirrors openapi.json query parameters.
// All names match the actual query params used by the backend (snake_case).
// ---------------------------------------------------------------------------

/**
 * Reusable date range filter.
 * Both fields are optional; when omitted the API returns all available data.
 *
 * @example { start_date: "2026-01-01", end_date: "2026-06-30" }
 * @see GET /api/metrics?start_date=&end_date=
 * @see GET /api/metrics/alerts?start_date=&end_date=
 * @see GET /api/metrics/categories/top?start_date=&end_date=
 */
export interface DateRangeFilter {
  /**
   * Inclusive start date.
   * Format: YYYY-MM-DD
   * When provided alone, filters from this date forward.
   */
  start_date?: string;

  /**
   * Inclusive end date.
   * Format: YYYY-MM-DD
   * When provided alone, filters up to this date.
   */
  end_date?: string;
}

// ---------------------------------------------------------------------------
// GET /api/metrics/alerts?threshold=&group_by=&start_date=&end_date=&business_type=
// ---------------------------------------------------------------------------

/**
 * Parameters for the alerts endpoint.
 * Alerts highlights periods where outcome exceeded a configurable threshold.
 *
 * Frontend validation (decision D6): threshold clamped to 0.01–1.0, step 0.01.
 * @see GET /api/metrics/alerts
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Alert sensitivity ratio. Minimum 0.01, maximum 1.0 (frontend-enforced).
   * Default on the API side: 0.3
   */
  threshold?: number;

  /**
   * Aggregation period for alert detection.
   * Valid values: "day" | "week" | "month"
   * @default "month"
   */
  group_by?: 'day' | 'week' | 'month';

  /**
   * Business line to filter on.
   * Valid values: "B2B" | "B2C"
   * When omitted, alerts are computed across all business types.
   */
  business_type?: 'B2B' | 'B2C';
}

// ---------------------------------------------------------------------------
// GET /api/metrics/categories/top?operation_type=&limit=&start_date=&end_date=&business_type=
// ---------------------------------------------------------------------------

/**
 * Parameters for the top-categories endpoint.
 * Returns the top N categories ranked by total amount for a given operation type.
 * @see GET /api/metrics/categories/top
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Whether to rank by income or by outcome.
   * Valid values: "income" | "outcome"
   * @default "outcome"
   */
  operation_type?: 'income' | 'outcome';

  /**
   * Number of categories to return.
   * Minimum: 1, Maximum: 20
   * @default 5
   */
  limit?: number;

  /**
   * Business line to filter on.
   * Valid values: "B2B" | "B2C"
   * When omitted, ranking is computed across all business types.
   */
  business_type?: 'B2B' | 'B2C';
}

// ---------------------------------------------------------------------------
// GET /api/metrics?start_date=&end_date=&category=&operation_type=
// ---------------------------------------------------------------------------

/**
 * Parameters for the main metrics endpoint (existing usage in App.tsx).
 * Returns the raw financial movements, optionally filtered.
 * @see GET /api/metrics
 */
export interface MetricsParams extends DateRangeFilter {
  /**
   * Filter by category.
   * Valid values: "suppliers" | "sales" | "operational" | "administrative" | "others"
   */
  category?: 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others';

  /**
   * Filter by operation type.
   * Valid values: "income" | "outcome"
   */
  operation_type?: 'income' | 'outcome';
}