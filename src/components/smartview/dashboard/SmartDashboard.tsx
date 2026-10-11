import { useSmartView } from "@/context/SmartViewContext";
import React, { Suspense } from "react";
import { Link } from "react-router";

const ReactApexChart = React.lazy(() => import("react-apexcharts"));

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({ label, value, trend, unit }: { label: string; value: string | number; trend?: "up" | "down" | "stable"; unit?: string }) {
  const trendColor = trend === "up" ? "text-success-500" : trend === "down" ? "text-error-500" : "text-gray-400";
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs transition-shadow hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
          {unit && <span className="ms-1 text-sm font-normal text-gray-400">{unit}</span>}
        </p>
        <span className={`text-base font-bold ${trendColor}`}>{trendIcon}</span>
      </div>
    </div>
  );
}

// ─── Smart Chart ─────────────────────────────────────────────────────────────

function SmartChart({ chart }: { chart: import("@/context/SmartViewContext").ChartConfig }) {
  const isDark = document.documentElement.classList.contains("dark");
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#f3f4f6";

  const baseOptions = {
    chart: {
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "Outfit, sans-serif",
      animations: { enabled: true, speed: 500 },
    },
    grid: { borderColor: gridColor, strokeDashArray: 4 },
    theme: { mode: isDark ? "dark" : "light" },
    tooltip: { theme: isDark ? "dark" : "light" },
    xaxis: { labels: { style: { colors: textColor, fontSize: "11px" } }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: textColor, fontSize: "11px" } } },
    legend: { labels: { colors: textColor } },
    colors: ["#465fff", "#12b76a", "#f79009", "#ef4444", "#8b5cf6"],
  };

  if (chart.type === "bar" || chart.type === "histogram") {
    const series = chart.options?.series
      ? (chart.options.series as string[]).map((col) => ({
          name: col,
          data: (chart.data as Record<string, unknown>[]).map((d) => Number(d[col]) || 0),
        }))
      : [{ name: chart.yColumn || "Value", data: (chart.data as Record<string, unknown>[]).map((d) => Number(d.value ?? d.y) || 0) }];

    return (
      <Suspense fallback={<div className="h-[220px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}>
        <ReactApexChart
          type="bar"
          height={220}
          series={series}
          options={{
            ...baseOptions,
            plotOptions: { bar: { borderRadius: 5, columnWidth: "65%" } },
            xaxis: {
              ...baseOptions.xaxis,
              categories: (chart.data as Record<string, unknown>[]).map((d) =>
                String(d.name ?? d.x ?? "").slice(0, 14)
              ),
            },
          }}
        />
      </Suspense>
    );
  }

  if (chart.type === "line" || chart.type === "area") {
    const vals = (chart.data as Record<string, number>[]).map((d) => Number(d.y) || 0);
    return (
      <Suspense fallback={<div className="h-[220px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}>
        <ReactApexChart
          type={chart.type === "area" ? "area" : "line"}
          height={220}
          series={[{ name: chart.yColumn || "Value", data: vals }]}
          options={{
            ...baseOptions,
            stroke: { curve: "smooth", width: 2.5 },
            fill: chart.type === "area" ? { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.01 } } : undefined,
            markers: { size: vals.length <= 30 ? 3 : 0 },
            xaxis: { ...baseOptions.xaxis, categories: (chart.data as Record<string, number>[]).map((d) => String(d.x)) },
          }}
        />
      </Suspense>
    );
  }

  if (chart.type === "pie") {
    const data = chart.data as { label: string; value: number }[];
    return (
      <Suspense fallback={<div className="h-[220px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}>
        <ReactApexChart
          type="pie"
          height={220}
          series={data.map((d) => d.value)}
          options={{
            ...baseOptions,
            labels: data.map((d) => d.label.slice(0, 18)),
            legend: { position: "bottom", labels: { colors: textColor } },
            dataLabels: { enabled: true, style: { fontSize: "10px" } },
          }}
        />
      </Suspense>
    );
  }

  if (chart.type === "scatter") {
    const data = chart.data as { x: number; y: number }[];
    return (
      <Suspense fallback={<div className="h-[220px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}>
        <ReactApexChart
          type="scatter"
          height={220}
          series={[{ name: `${chart.xColumn} vs ${chart.yColumn}`, data: data.map((d) => [d.x, d.y]) }]}
          options={{
            ...baseOptions,
            markers: { size: 4, strokeWidth: 0, fillOpacity: 0.7 },
          }}
        />
      </Suspense>
    );
  }

  return null;
}

// ─── Insight Badge ────────────────────────────────────────────────────────────

const insightStyles = {
  finding: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", icon: "💡", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  recommendation: { bg: "bg-success-50 dark:bg-success-900/20", border: "border-success-200 dark:border-success-800", icon: "✅", badge: "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300" },
  warning: { bg: "bg-warning-50 dark:bg-warning-900/20", border: "border-warning-200 dark:border-warning-800", icon: "⚠️", badge: "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300" },
  anomaly: { bg: "bg-error-50 dark:bg-error-900/20", border: "border-error-200 dark:border-error-800", icon: "🔍", badge: "bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300" },
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function SmartDashboard() {
  const { currentDataset } = useSmartView();

  if (!currentDataset) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-900/20">
          <svg className="h-10 w-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <h2 className="mb-2 text-title-sm font-bold text-gray-900 dark:text-white">No Dataset Loaded</h2>
        <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Upload a CSV or Excel file to generate your Smart Dashboard with AI-powered insights, visualisations, and recommendations.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-brand-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Dataset
        </Link>
      </div>
    );
  }

  const { stats, kpis, insights, charts, anomalies, clusters, trends, name, uploadedAt, preprocessingLog } = currentDataset;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10c0-3.866 3.134-7 7-7s7 3.134 7 7-3.134 7-7 7-7-3.134-7-7Z" fill="white" fillOpacity="0.2"/>
                <path d="M6 10l2.5 2.5L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-title-sm font-bold text-gray-900 dark:text-white">Smart Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {name} · Analysed {new Date(uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            New Dataset
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Report
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.slice(0, 6).map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {charts.map((chart) => (
          <div key={chart.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{chart.title}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">{chart.description}</p>
            </div>
            <SmartChart chart={chart} />
          </div>
        ))}
      </div>

      {/* 3-col grid: Stats | Anomalies | Trends */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Dataset Statistics */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Dataset Overview</h3>
          <div className="space-y-3">
            {[
              { label: "Rows", value: stats.rowCount.toLocaleString() },
              { label: "Columns", value: stats.colCount },
              { label: "Duplicate Rows Removed", value: stats.duplicateRows },
              { label: "Missing Cells Filled", value: stats.nullCells },
              { label: "Data Completeness", value: `${stats.completeness}%` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Column Types</p>
              <div className="flex flex-wrap gap-1">
                {["numeric", "categorical", "datetime", "boolean"].map((type) => {
                  const count = stats.columns.filter((c) => c.type === type).length;
                  if (count === 0) return null;
                  return (
                    <span key={type} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      {count} {type}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Anomaly Detection</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${anomalies.length > 0 ? "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400" : "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"}`}>
              {anomalies.length} found
            </span>
          </div>
          {anomalies.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="mb-2 text-3xl">✅</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">No anomalies detected. Dataset values are within expected bounds.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {anomalies.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-error-100 bg-error-50 px-3 py-2 dark:border-error-900 dark:bg-error-900/20">
                  <div>
                    <p className="text-xs font-medium text-error-700 dark:text-error-400">{a.column}</p>
                    <p className="text-xs text-error-500">Row {a.rowIndex + 1} · Value: {a.value}</p>
                  </div>
                  <span className="text-xs font-bold text-error-600 dark:text-error-400">Z={a.zScore}</span>
                </div>
              ))}
              {anomalies.length > 6 && (
                <p className="text-center text-xs text-gray-400">+{anomalies.length - 6} more</p>
              )}
            </div>
          )}
        </div>

        {/* Trend Analysis */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Trend Analysis</h3>
          {trends.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No numeric trends detected.</p>
          ) : (
            <div className="space-y-3">
              {trends.slice(0, 6).map((t) => (
                <div key={t.column} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${t.direction === "upward" ? "text-success-500" : t.direction === "downward" ? "text-error-500" : "text-gray-400"}`}>
                      {t.direction === "upward" ? "↗" : t.direction === "downward" ? "↘" : "→"}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.column}</span>
                  </div>
                  <div className="text-end">
                    <span className={`block text-xs font-semibold capitalize ${t.direction === "upward" ? "text-success-600" : t.direction === "downward" ? "text-error-600" : "text-gray-500"}`}>
                      {t.direction}
                    </span>
                    <span className="block text-xs text-gray-400">slope: {t.slope}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cluster Summary */}
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">K-Means Clusters</h4>
            {(() => {
              const clusterCounts: Record<number, number> = {};
              clusters.forEach((c) => { clusterCounts[c.cluster] = (clusterCounts[c.cluster] || 0) + 1; });
              const colors = ["bg-brand-500", "bg-success-500", "bg-warning-500", "bg-error-500", "bg-purple-500"];
              return (
                <div className="space-y-2">
                  {Object.entries(clusterCounts).map(([cluster, count]) => (
                    <div key={cluster} className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${colors[Number(cluster) % colors.length]}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Cluster {Number(cluster) + 1}</span>
                      <div className="mx-1 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-1.5 rounded-full ${colors[Number(cluster) % colors.length]}`}
                          style={{ width: `${Math.round((count / clusters.length) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights & Recommendations</h3>
            <p className="text-xs text-gray-400">Generated by SmartView AI · For decision-support only</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {insights.map((insight, i) => {
            const style = insightStyles[insight.type];
            return (
              <div key={i} className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
                <div className="mb-2 flex items-start gap-2">
                  <span className="mt-0.5 text-base leading-none">{style.icon}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                      <span className={`rounded-full px-1.5 py-0.5 text-xs capitalize ${style.badge}`}>{insight.priority}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preprocessing Log */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Preprocessing Log</h3>
        <div className="space-y-1 rounded-xl bg-gray-50 p-4 font-mono text-xs dark:bg-gray-800/60">
          {preprocessingLog.map((line, i) => (
            <p key={i} className="text-gray-700 dark:text-gray-300">{line}</p>
          ))}
        </div>
      </div>

      {/* Column Statistics */}
      {Object.keys(stats.numericStats).length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Column Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {["Column", "Min", "Max", "Mean", "Median", "Std Dev", "Q1", "Q3"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.numericStats).map(([col, s]) => (
                  <tr key={col} className="border-b border-gray-50 hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/40">
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{col}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.min.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.max.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.mean.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.median.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.std.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.q1.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{s.q3.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
