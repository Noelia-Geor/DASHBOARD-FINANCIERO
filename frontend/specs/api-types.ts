// ---------------------------------------------------------------------------
// API response types — vendored from openapi.json + real curl verification.
// Only fields marked ✅ in verification.md are included.
// Fields marked ❓ appear as // TODO comments.
// ---------------------------------------------------------------------------

/**
 * Faceted metadata returned by the facets endpoint.
 * @see GET /api/metrics/facets
 */
export interface FacetsResponse {
  /** Distinct operation types available in the dataset. */
  operation_types: Array<'income' | 'outcome'>;

  /** Distinct business lines available in the dataset. */
  business_types: Array<'B2B' | 'B2C'>;

  /**
   * All categories present in the dataset.
   * Valid values: "suppliers" | "sales" | "operational" | "administrative" | "others"
   * @see GET /api/metrics/facets — field `categories`
   */
  categories: Array<'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'>;

  /**
   * Earliest movement date in the dataset.
   * Format: YYYY-MM-DD
   * @see GET /api/metrics/facets — field `min_date`
   */
  min_date: string;

  /**
   * Latest movement date in the dataset.
   * Format: YYYY-MM-DD
   * @see GET /api/metrics/facets — field `max_date`
   */
  max_date: string;
}

// ---------------------------------------------------------------------------
// GET /api/metrics/alerts?threshold=0.3
// ---------------------------------------------------------------------------

/**
 * A single alert row — a period where outcome exceeded the baseline.
 * @see GET /api/metrics/alerts — item of the response array
 */
export interface AlertEntry {
  /**
   * Period identifier. Format depends on `group_by` (default: "YYYY-MM" for monthly).
   * Example: "2025-12", "2026-03"
   * @see GET /api/metrics/alerts — field `period`
   */
  period: string;

  /**
   * Total outcome amount for this period.
   * @see GET /api/metrics/alerts — field `outcome_total`
   */
  outcome_total: number;

  /**
   * Moving average of outcome over the 3 previous periods.
   * @see GET /api/metrics/alerts — field `baseline_average`
   */
  baseline_average: number;

  /**
   * How much the outcome exceeded the baseline, expressed as a ratio.
   * Multiply by 100 to get a percentage.
   * Example: 1.0201 → 102.01 % increase.
   * @see GET /api/metrics/alerts — field `increase_ratio`
   */
  increase_ratio: number;
}

/**
 * Response from the alerts endpoint.
 * @see GET /api/metrics/alerts?threshold=<ratio>
 */
export type AlertsResponse = AlertEntry[];

// ---------------------------------------------------------------------------
// GET /api/metrics/categories/top?operation_type=income&limit=5
// ---------------------------------------------------------------------------

/**
 * A single entry in the top-categories ranking.
 * @see GET /api/metrics/categories/top — item of the response array
 */
export interface CategoryEntry {
  /**
   * Category name.
   * Valid values: "suppliers" | "sales" | "operational" | "administrative" | "others"
   * @see GET /api/metrics/categories/top — field `category`
   */
  category: 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others';

  /**
   * Operation type of the aggregated records.
   * Valid values: "income" | "outcome"
   * @see GET /api/metrics/categories/top — field `operation_type`
   */
  operation_type: 'income' | 'outcome';

  /**
   * Total monetary amount for this category and operation type.
   * @see GET /api/metrics/categories/top — field `total_amount`
   */
  total_amount: number;
}

/**
 * Response from the top-categories endpoint.
 * @see GET /api/metrics/categories/top?operation_type=<type>&limit=<n>
 */
export type TopCategoriesResponse = CategoryEntry[];