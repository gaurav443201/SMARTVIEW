/**
 * SmartView ML Analysis Engine
 * Pure TypeScript implementations of statistical/ML algorithms:
 * - Z-score anomaly detection
 * - K-Means clustering
 * - Linear regression / moving average trend analysis
 * - Automatic chart type selection
 * - KPI generation
 * - Insight & recommendation generation
 */

import type {
  AnomalyResult,
  ChartConfig,
  ClusterResult,
  Dataset,
  DatasetColumn,
  DatasetStats,
  Insight,
  KPI,
  TrendResult,
} from "../context/SmartViewContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isNumeric(val: unknown): val is number {
  return typeof val === "number" && !isNaN(val);
}

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[], avg?: number): number {
  if (arr.length < 2) return 0;
  const m = avg ?? mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function pearson(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const mx = mean(x);
  const my = mean(y);
  const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
      y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  );
  return den === 0 ? 0 : Math.round((num / den) * 1000) / 1000;
}

// ─── Step 1: Type Detection ───────────────────────────────────────────────────

export function detectColumnType(
  values: unknown[]
): DatasetColumn["type"] {
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (nonNull.length === 0) return "unknown";

  const numericCount = nonNull.filter((v) => toNumber(v) !== null).length;
  if (numericCount / nonNull.length > 0.85) return "numeric";

  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{2}\/\d{2}\/\d{4}/,
    /^\d{2}-\d{2}-\d{4}/,
  ];
  const dateCount = nonNull.filter(
    (v) => typeof v === "string" && datePatterns.some((p) => p.test(v))
  ).length;
  if (dateCount / nonNull.length > 0.5) return "datetime";

  const boolValues = new Set(["true", "false", "yes", "no", "1", "0", "t", "f"]);
  const boolCount = nonNull.filter(
    (v) =>
      typeof v === "string" && boolValues.has(v.toLowerCase())
  ).length;
  if (boolCount / nonNull.length > 0.8) return "boolean";

  return "categorical";
}

// ─── Step 2: Preprocessing ───────────────────────────────────────────────────

export function preprocessData(
  raw: Record<string, unknown>[],
  log: string[]
): Record<string, unknown>[] {
  if (raw.length === 0) return [];
  log.push(`✅ Loaded ${raw.length} rows.`);

  // Remove exact duplicates
  const seen = new Set<string>();
  const deduped = raw.filter((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const dupCount = raw.length - deduped.length;
  if (dupCount > 0) log.push(`🔁 Removed ${dupCount} duplicate row(s).`);

  // Coerce numeric strings, fill nulls
  const columns = Object.keys(deduped[0] ?? {});
  const cleaned = deduped.map((row) => {
    const r: Record<string, unknown> = {};
    for (const col of columns) {
      const val = row[col];
      if (val === null || val === undefined || val === "") {
        r[col] = null;
      } else {
        const num = toNumber(val);
        r[col] = num !== null ? num : val;
      }
    }
    return r;
  });

  // Count nulls per column and fill numeric nulls with column mean
  for (const col of columns) {
    const vals = cleaned.map((r) => r[col]);
    const numericVals = vals.filter((v) => isNumeric(v)) as number[];
    const nullCount = vals.filter((v) => v === null).length;

    if (nullCount > 0 && numericVals.length > 0) {
      const m = mean(numericVals);
      for (const row of cleaned) {
        if (row[col] === null) row[col] = Math.round(m * 100) / 100;
      }
      log.push(`🔧 Filled ${nullCount} missing value(s) in "${col}" with mean (${m.toFixed(2)}).`);
    } else if (nullCount > 0) {
      log.push(`⚠️ Column "${col}" has ${nullCount} missing value(s) (categorical – left as null).`);
    }
  }

  log.push(`✅ Preprocessing complete. ${cleaned.length} clean row(s) ready for analysis.`);
  return cleaned;
}

// ─── Step 3: Statistics ───────────────────────────────────────────────────────

export function computeStats(
  raw: Record<string, unknown>[],
  cleaned: Record<string, unknown>[]
): DatasetStats {
  if (cleaned.length === 0) {
    return {
      rowCount: 0,
      colCount: 0,
      nullCells: 0,
      duplicateRows: 0,
      completeness: 100,
      columns: [],
      numericStats: {},
      correlationMatrix: {},
    };
  }

  const columns = Object.keys(cleaned[0]);
  const dupRows = raw.length - cleaned.length;

  const colInfos: DatasetColumn[] = columns.map((col) => {
    const vals = raw.map((r) => r[col]);
    const nonNull = vals.filter((v) => v !== null && v !== undefined && v !== "");
    const uniqueVals = new Set(nonNull.map((v) => String(v)));
    return {
      name: col,
      type: detectColumnType(vals),
      nullCount: vals.length - nonNull.length,
      uniqueCount: uniqueVals.size,
      sampleValues: nonNull.slice(0, 5) as (string | number | null)[],
    };
  });

  const totalCells = raw.length * columns.length;
  const nullCells = colInfos.reduce((s, c) => s + c.nullCount, 0);
  const completeness = totalCells === 0 ? 100 : Math.round(((totalCells - nullCells) / totalCells) * 100);

  // Numeric stats
  const numericStats: DatasetStats["numericStats"] = {};
  const numericCols = colInfos.filter((c) => c.type === "numeric").map((c) => c.name);
  for (const col of numericCols) {
    const vals = cleaned.map((r) => r[col]).filter(isNumeric) as number[];
    if (vals.length === 0) continue;
    const m = mean(vals);
    numericStats[col] = {
      min: Math.min(...vals),
      max: Math.max(...vals),
      mean: Math.round(m * 100) / 100,
      median: median(vals),
      std: Math.round(std(vals, m) * 100) / 100,
      q1: quantile(vals, 0.25),
      q3: quantile(vals, 0.75),
    };
  }

  // Correlation matrix
  const correlationMatrix: Record<string, Record<string, number>> = {};
  for (const c1 of numericCols) {
    correlationMatrix[c1] = {};
    for (const c2 of numericCols) {
      const x = cleaned.map((r) => r[c1]).filter(isNumeric) as number[];
      const y = cleaned.map((r) => r[c2]).filter(isNumeric) as number[];
      const len = Math.min(x.length, y.length);
      correlationMatrix[c1][c2] = pearson(x.slice(0, len), y.slice(0, len));
    }
  }

  return {
    rowCount: cleaned.length,
    colCount: columns.length,
    nullCells,
    duplicateRows: dupRows,
    completeness,
    columns: colInfos,
    numericStats,
    correlationMatrix,
  };
}

// ─── Step 4: Anomaly Detection (Z-Score) ─────────────────────────────────────

export function detectAnomalies(
  data: Record<string, unknown>[],
  stats: DatasetStats,
  threshold = 2.5
): AnomalyResult[] {
  const results: AnomalyResult[] = [];
  for (const [col, s] of Object.entries(stats.numericStats)) {
    if (s.std === 0) continue;
    data.forEach((row, rowIndex) => {
      const val = row[col];
      if (!isNumeric(val)) return;
      const zScore = Math.abs((val - s.mean) / s.std);
      if (zScore > threshold) {
        results.push({ rowIndex, column: col, value: val, zScore: Math.round(zScore * 100) / 100, isAnomaly: true });
      }
    });
  }
  return results;
}

// ─── Step 5: K-Means Clustering ───────────────────────────────────────────────

export function kMeansClustering(
  data: Record<string, unknown>[],
  stats: DatasetStats,
  k = 3,
  maxIter = 50
): ClusterResult[] {
  const numericCols = Object.keys(stats.numericStats);
  if (numericCols.length === 0 || data.length < k) {
    return data.map((_, i) => ({ rowIndex: i, cluster: 0, distance: 0 }));
  }

  // Normalize data points
  const points = data.map((row) =>
    numericCols.map((col) => {
      const s = stats.numericStats[col];
      const val = row[col];
      if (!isNumeric(val) || s.std === 0) return 0;
      return (val - s.mean) / s.std;
    })
  );

  // Init centroids (pick k evenly spaced points)
  const step = Math.floor(points.length / k);
  let centroids = Array.from({ length: k }, (_, i) => [...points[i * step]]);

  let assignments = new Array<number>(points.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign
    const newAssign = points.map((pt) => {
      let minDist = Infinity;
      let best = 0;
      centroids.forEach((c, ci) => {
        const d = Math.sqrt(pt.reduce((s, v, j) => s + (v - c[j]) ** 2, 0));
        if (d < minDist) { minDist = d; best = ci; }
      });
      return best;
    });

    if (newAssign.every((a, i) => a === assignments[i])) break;
    assignments = newAssign;

    // Recompute centroids
    centroids = Array.from({ length: k }, (_, ci) => {
      const group = points.filter((_, i) => assignments[i] === ci);
      if (group.length === 0) return centroids[ci];
      return numericCols.map((_, j) => mean(group.map((p) => p[j])));
    });
  }

  return points.map((pt, i) => {
    const c = centroids[assignments[i]];
    const dist = Math.sqrt(pt.reduce((s, v, j) => s + (v - c[j]) ** 2, 0));
    return { rowIndex: i, cluster: assignments[i], distance: Math.round(dist * 1000) / 1000 };
  });
}

// ─── Step 6: Trend Analysis ───────────────────────────────────────────────────

export function analyzeTrends(
  data: Record<string, unknown>[],
  stats: DatasetStats
): TrendResult[] {
  const results: TrendResult[] = [];
  for (const col of Object.keys(stats.numericStats)) {
    const vals = data.map((r) => r[col]).filter(isNumeric) as number[];
    if (vals.length < 3) continue;

    // Linear regression slope
    const n = vals.length;
    const xs = vals.map((_, i) => i);
    const meanX = mean(xs);
    const meanY = mean(vals);
    const slope =
      xs.reduce((s, x, i) => s + (x - meanX) * (vals[i] - meanY), 0) /
      (xs.reduce((s, x) => s + (x - meanX) ** 2, 0) || 1);

    // Moving average trendline
    const window = Math.max(3, Math.floor(n / 10));
    const trendLine = vals.map((_, i) => {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(n, start + window);
      return Math.round(mean(vals.slice(start, end)) * 100) / 100;
    });

    const direction: TrendResult["direction"] =
      Math.abs(slope) < 0.01 * (stats.numericStats[col].std || 1)
        ? "stable"
        : slope > 0
        ? "upward"
        : "downward";

    results.push({ column: col, direction, slope: Math.round(slope * 10000) / 10000, trendLine });
  }
  return results;
}

// ─── Step 7: KPI Generation ───────────────────────────────────────────────────

export function generateKPIs(stats: DatasetStats, anomalies: AnomalyResult[], clusters: ClusterResult[]): KPI[] {
  const kpis: KPI[] = [
    {
      label: "Total Records",
      value: stats.rowCount.toLocaleString(),
      trend: "stable",
      unit: "rows",
    },
    {
      label: "Data Completeness",
      value: `${stats.completeness}%`,
      trend: stats.completeness >= 90 ? "up" : stats.completeness < 70 ? "down" : "stable",
    },
    {
      label: "Anomalies Detected",
      value: anomalies.length,
      trend: anomalies.length === 0 ? "up" : anomalies.length > 10 ? "down" : "stable",
      unit: "records",
    },
    {
      label: "Data Clusters",
      value: new Set(clusters.map((c) => c.cluster)).size,
      trend: "stable",
      unit: "groups",
    },
    {
      label: "Total Columns",
      value: stats.colCount,
      trend: "stable",
      unit: "features",
    },
    {
      label: "Duplicate Rows",
      value: stats.duplicateRows,
      trend: stats.duplicateRows === 0 ? "up" : "down",
      unit: "rows",
    },
  ];

  // Add top numeric KPIs
  for (const [col, s] of Object.entries(stats.numericStats).slice(0, 3)) {
    kpis.push({
      label: `Avg ${col}`,
      value: s.mean.toLocaleString(),
      trend: "stable",
    });
  }

  return kpis;
}

// ─── Step 8: Insights & Recommendations ──────────────────────────────────────

export function generateInsights(
  stats: DatasetStats,
  anomalies: AnomalyResult[],
  clusters: ClusterResult[],
  trends: TrendResult[]
): Insight[] {
  const insights: Insight[] = [];

  // Data quality
  if (stats.completeness < 80) {
    insights.push({
      type: "warning",
      title: "Low Data Completeness",
      description: `Only ${stats.completeness}% of cells contain valid data. Consider collecting missing values or applying imputation techniques.`,
      priority: "high",
    });
  } else if (stats.completeness >= 95) {
    insights.push({
      type: "finding",
      title: "Excellent Data Quality",
      description: `Dataset is ${stats.completeness}% complete — excellent foundation for reliable analysis.`,
      priority: "low",
    });
  }

  if (stats.duplicateRows > 0) {
    const pct = Math.round((stats.duplicateRows / (stats.rowCount + stats.duplicateRows)) * 100);
    insights.push({
      type: "warning",
      title: "Duplicate Records Found",
      description: `${stats.duplicateRows} duplicate row(s) (${pct}%) were removed during preprocessing. This may indicate data pipeline issues.`,
      priority: stats.duplicateRows > stats.rowCount * 0.1 ? "high" : "medium",
    });
  }

  // Anomalies
  if (anomalies.length > 0) {
    const byCols = anomalies.reduce<Record<string, number>>((acc, a) => {
      acc[a.column] = (acc[a.column] || 0) + 1;
      return acc;
    }, {});
    const topCol = Object.entries(byCols).sort((a, b) => b[1] - a[1])[0];
    insights.push({
      type: "anomaly",
      title: `${anomalies.length} Anomalous Record(s) Detected`,
      description: `Column "${topCol[0]}" has the most outliers (${topCol[1]}). Review these records for data entry errors or genuine outliers worth investigating.`,
      priority: anomalies.length > 20 ? "high" : "medium",
      affectedColumn: topCol[0],
    });
  } else {
    insights.push({
      type: "finding",
      title: "No Significant Anomalies",
      description: "The dataset values are within expected statistical bounds. Data distribution appears normal.",
      priority: "low",
    });
  }

  // Clusters
  const clusterCount = new Set(clusters.map((c) => c.cluster)).size;
  insights.push({
    type: "finding",
    title: `${clusterCount} Natural Data Group(s) Identified`,
    description: `K-Means clustering identified ${clusterCount} distinct segment(s) in the data. Consider analyzing each cluster's characteristics for targeted strategies.`,
    priority: "medium",
  });

  // Trends
  const upTrends = trends.filter((t) => t.direction === "upward");
  const downTrends = trends.filter((t) => t.direction === "downward");
  if (upTrends.length > 0) {
    insights.push({
      type: "recommendation",
      title: `Upward Trend in ${upTrends.length} Metric(s)`,
      description: `Columns ${upTrends.map((t) => `"${t.column}"`).join(", ")} show positive growth trends. Investigate drivers and consider scaling related operations.`,
      priority: "medium",
    });
  }
  if (downTrends.length > 0) {
    insights.push({
      type: "recommendation",
      title: `Declining Trend in ${downTrends.length} Metric(s)`,
      description: `Columns ${downTrends.map((t) => `"${t.column}"`).join(", ")} show downward trends. Immediate investigation is recommended to identify root causes.`,
      priority: "high",
    });
  }

  // Correlation
  const highCorrs: { c1: string; c2: string; corr: number }[] = [];
  for (const [c1, row] of Object.entries(stats.correlationMatrix)) {
    for (const [c2, corr] of Object.entries(row)) {
      if (c1 < c2 && Math.abs(corr) > 0.7) {
        highCorrs.push({ c1, c2, corr });
      }
    }
  }
  if (highCorrs.length > 0) {
    const top = highCorrs.sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr))[0];
    insights.push({
      type: "finding",
      title: "Strong Column Correlation Found",
      description: `"${top.c1}" and "${top.c2}" have a ${top.corr > 0 ? "positive" : "negative"} correlation of ${top.corr.toFixed(2)}. This relationship may be useful for predictive modelling.`,
      priority: "medium",
    });
  }

  // General recommendations
  insights.push({
    type: "recommendation",
    title: "Segment-Based Strategy",
    description: `Based on ${clusterCount} identified cluster(s), consider building tailored approaches for each segment to maximize impact.`,
    priority: "low",
  });

  return insights;
}

// ─── Step 9: Automatic Chart Selection ───────────────────────────────────────

export function generateCharts(
  data: Record<string, unknown>[],
  stats: DatasetStats
): ChartConfig[] {
  const charts: ChartConfig[] = [];
  const numericCols = Object.keys(stats.numericStats);
  const categoricalCols = stats.columns.filter((c) => c.type === "categorical").map((c) => c.name);

  // 1. Distribution Histogram for first numeric column
  if (numericCols.length > 0) {
    const col = numericCols[0];
    const vals = data.map((r) => r[col]).filter(isNumeric) as number[];
    const s = stats.numericStats[col];
    const binCount = Math.min(20, Math.ceil(Math.sqrt(vals.length)));
    const binSize = (s.max - s.min) / binCount || 1;
    const bins: { x: string; y: number }[] = Array.from({ length: binCount }, (_, i) => ({
      x: `${(s.min + i * binSize).toFixed(1)}–${(s.min + (i + 1) * binSize).toFixed(1)}`,
      y: 0,
    }));
    vals.forEach((v) => {
      const idx = Math.min(binCount - 1, Math.floor((v - s.min) / binSize));
      bins[idx].y++;
    });
    charts.push({
      id: "histogram-1",
      type: "histogram",
      title: `Distribution of ${col}`,
      description: `Frequency distribution showing how "${col}" values are spread across the dataset.`,
      yColumn: col,
      data: bins,
    });
  }

  // 2. Bar chart for top categorical column
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    const catCol = categoricalCols[0];
    const numCol = numericCols[0];
    const grouped: Record<string, number[]> = {};
    data.forEach((row) => {
      const key = String(row[catCol] ?? "Unknown");
      const val = row[numCol];
      if (isNumeric(val)) {
        grouped[key] = grouped[key] || [];
        grouped[key].push(val);
      }
    });
    const barData = Object.entries(grouped)
      .slice(0, 15)
      .map(([name, vals]) => ({ name, value: Math.round(mean(vals) * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
    charts.push({
      id: "bar-cat-1",
      type: "bar",
      title: `Average ${numCol} by ${catCol}`,
      description: `Comparison of average "${numCol}" across different "${catCol}" categories.`,
      xColumn: catCol,
      yColumn: numCol,
      data: barData,
    });
  }

  // 3. Line chart / trend for second numeric column
  if (numericCols.length > 1) {
    const col = numericCols[1];
    const vals = data.map((r, i) => ({
      x: i + 1,
      y: (r[col] as number) || 0,
    })).slice(0, 100);
    charts.push({
      id: "line-trend-1",
      type: "line",
      title: `Trend of ${col} Over Records`,
      description: `Sequential value plot showing how "${col}" changes across dataset records.`,
      yColumn: col,
      data: vals,
    });
  }

  // 4. Scatter plot for two numeric columns
  if (numericCols.length >= 2) {
    const [xCol, yCol] = [numericCols[0], numericCols[1]];
    const scatterData = data
      .slice(0, 200)
      .map((row) => ({ x: row[xCol] as number, y: row[yCol] as number }))
      .filter((d) => isNumeric(d.x) && isNumeric(d.y));
    charts.push({
      id: "scatter-1",
      type: "scatter",
      title: `${xCol} vs ${yCol}`,
      description: `Scatter plot revealing the relationship between "${xCol}" and "${yCol}".`,
      xColumn: xCol,
      yColumn: yCol,
      data: scatterData,
    });
  }

  // 5. Pie chart for top categorical distribution
  if (categoricalCols.length > 0) {
    const col = categoricalCols[0];
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const key = String(row[col] ?? "Unknown");
      counts[key] = (counts[key] || 0) + 1;
    });
    const pieData = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));
    charts.push({
      id: "pie-cat-1",
      type: "pie",
      title: `${col} Distribution`,
      description: `Proportional breakdown of records by "${col}" category.`,
      xColumn: col,
      data: pieData,
    });
  }

  // 6. Area chart for numeric column 3 or fallback
  const areaCol = numericCols[2] || numericCols[0];
  if (areaCol) {
    const vals = data.map((r, i) => ({
      x: i + 1,
      y: (r[areaCol] as number) || 0,
    })).slice(0, 80);
    charts.push({
      id: "area-1",
      type: "area",
      title: `${areaCol} Area Trend`,
      description: `Cumulative area view of "${areaCol}" trend across records.`,
      yColumn: areaCol,
      data: vals,
    });
  }

  // 7. Multi-series bar for multiple numeric columns
  if (numericCols.length >= 3 && categoricalCols.length > 0) {
    const catCol = categoricalCols[0];
    const cols = numericCols.slice(0, 3);
    const grouped: Record<string, Record<string, number[]>> = {};
    data.forEach((row) => {
      const key = String(row[catCol] ?? "Unknown");
      grouped[key] = grouped[key] || {};
      cols.forEach((c) => {
        grouped[key][c] = grouped[key][c] || [];
        const val = row[c];
        if (isNumeric(val)) grouped[key][c].push(val);
      });
    });
    const multiData = Object.entries(grouped).slice(0, 10).map(([name, colData]) => {
      const entry: Record<string, unknown> = { name };
      cols.forEach((c) => {
        const vals = colData[c] || [];
        entry[c] = vals.length > 0 ? Math.round(mean(vals) * 100) / 100 : 0;
      });
      return entry;
    });
    charts.push({
      id: "multi-bar-1",
      type: "bar",
      title: `Multi-Metric by ${catCol}`,
      description: `Grouped comparison of ${cols.join(", ")} across "${catCol}" categories.`,
      xColumn: catCol,
      data: multiData,
      options: { series: cols },
    });
  }

  return charts;
}

// ─── Master Analysis Runner ───────────────────────────────────────────────────

export interface AnalysisProgressCallback {
  (step: string, progress: number): void;
}

export async function runFullAnalysis(
  raw: Record<string, unknown>[],
  filename: string,
  onProgress: AnalysisProgressCallback
): Promise<Omit<Dataset, "id" | "uploadedAt" | "name">> {
  const log: string[] = [];

  onProgress("Preprocessing data…", 10);
  await sleep(300);
  const cleanedData = preprocessData(raw, log);

  onProgress("Computing statistics…", 25);
  await sleep(200);
  const stats = computeStats(raw, cleanedData);

  onProgress("Detecting anomalies…", 40);
  await sleep(400);
  const anomalies = detectAnomalies(cleanedData, stats);

  onProgress("Running K-Means clustering…", 55);
  await sleep(600);
  const clusters = kMeansClustering(cleanedData, stats);

  onProgress("Analysing trends…", 70);
  await sleep(300);
  const trends = analyzeTrends(cleanedData, stats);

  onProgress("Generating visualizations…", 80);
  await sleep(300);
  const charts = generateCharts(cleanedData, stats);

  onProgress("Generating KPIs…", 88);
  await sleep(200);
  const kpis = generateKPIs(stats, anomalies, clusters);

  onProgress("Building insights…", 94);
  await sleep(300);
  const insights = generateInsights(stats, anomalies, clusters, trends);

  onProgress("Analysis complete!", 100);
  await sleep(200);

  void filename; // unused but kept for future logging

  return {
    rawData: raw,
    cleanedData,
    stats,
    anomalies,
    clusters,
    trends,
    kpis,
    insights,
    charts,
    preprocessingLog: log,
    status: "ready",
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
