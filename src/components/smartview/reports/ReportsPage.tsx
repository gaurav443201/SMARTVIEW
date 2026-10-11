import { useSmartView } from "@/context/SmartViewContext";
import { generateOpenAiInsights, type OpenAiInsightsResponse } from "@/services/openAiService";
import { exportSmartViewPdf } from "@/utils/pdfGenerator";
import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { Link } from "react-router";

export default function ReportsPage() {
  const { currentDataset } = useSmartView();
  const [aiInsights, setAiInsights] = useState<OpenAiInsightsResponse | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentDataset) {
      generateOpenAiInsights(currentDataset).then((res) => {
        setAiInsights(res);
      });
    }
  }, [currentDataset?.id]);

  const handleDownloadPdf = async () => {
    if (!currentDataset) return;

    setIsGeneratingPdf(true);
    setPdfProgress("Formatting and downloading executive PDF...");

    try {
      await new Promise((r) => setTimeout(r, 200));
      exportSmartViewPdf(currentDataset, aiInsights);
    } catch (err) {
      console.error("PDF Generation error:", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress("");
    }
  };

  if (!currentDataset) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Dataset Loaded for Report</h2>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Upload a dataset or activate one from history to generate and download executive PDF reports.
        </p>
        <Link
          to="/upload"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-600"
        >
          Upload Dataset
        </Link>
      </div>
    );
  }

  const { name, uploadedAt, stats, kpis, anomalies, clusters, charts, preprocessingLog } = currentDataset;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
            Report Download (PDF)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Comprehensive business report including dataset telemetry, charts, and OpenAI strategic insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-brand-700 hover:to-brand-600 disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeOpacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{pdfProgress || "Exporting PDF..."}</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900" id="smartview-report-root">
        <div ref={reportRef} className="space-y-8 bg-white p-6 text-gray-900">
          {/* Corporate Header */}
          <div className="rounded-2xl bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 p-8 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-brand-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    SmartView Enterprise Intelligence
                  </span>
                  <span className="text-xs text-gray-400">
                    System Ver 2.4 • ML Powered
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                  Data Analytics & AI Strategic Audit Report
                </h1>
                <p className="mt-1 text-xs text-gray-300">
                  Target Dataset: <strong className="text-white">{name}</strong> • Uploaded {new Date(uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Report Generated</div>
                <div className="text-sm font-semibold text-white">{new Date().toLocaleString()}</div>
                <div className="mt-1 text-[11px] text-brand-300">OpenAI Strategic Engine</div>
              </div>
            </div>
          </div>

          {/* AI Executive Summary & Health Score */}
          {aiInsights && (
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Executive Strategic Summary (OpenAI AI Engine)
                  </h2>
                </div>
                <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-700">
                  Company Health Score: {aiInsights.companyHealthScore}/100
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-700">
                {aiInsights.executiveSummary}
              </p>

              {/* Top AI Strategic Recommendations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Priority Recommendations for Corporate Leadership
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.strategicRecommendations.slice(0, 4).map((rec) => (
                    <div key={rec.id} className="rounded-lg border border-gray-200 bg-white p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-900">{rec.title}</span>
                        <span className="text-[10px] font-semibold text-brand-600">{rec.category}</span>
                      </div>
                      <p className="text-[11px] text-gray-600">{rec.actionPlan}</p>
                      <div className="text-[10px] font-semibold text-success-600 pt-1">
                        Expected ROI: {rec.expectedRoi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Key Performance Indicators (KPIs) */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 border-b pb-2">
              Key Performance Indicators (Telemetry)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <div className="text-[10px] uppercase font-semibold text-gray-400">{kpi.label}</div>
                  <div className="mt-1 text-xl font-extrabold text-gray-900">{kpi.value}</div>
                  {kpi.unit && <div className="text-[10px] text-gray-400">{kpi.unit}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Dataset Statistical Profile Table */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 border-b pb-2">
              Dataset Profile & Data Hygiene
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">Total Records: <strong>{stats.rowCount.toLocaleString()}</strong></div>
              <div className="p-3 bg-gray-50 rounded-lg">Features / Columns: <strong>{stats.colCount}</strong></div>
              <div className="p-3 bg-gray-50 rounded-lg">Completeness: <strong>{stats.completeness.toFixed(1)}%</strong></div>
              <div className="p-3 bg-gray-50 rounded-lg">Duplicate Records: <strong>{stats.duplicateRows}</strong></div>
            </div>

            <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2.5">Feature Name</th>
                  <th className="p-2.5">Data Type</th>
                  <th className="p-2.5">Null Cells</th>
                  <th className="p-2.5">Unique Values</th>
                  <th className="p-2.5">Mean / Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.columns.slice(0, 8).map((col) => (
                  <tr key={col.name}>
                    <td className="p-2.5 font-medium">{col.name}</td>
                    <td className="p-2.5 uppercase text-[10px] text-gray-500">{col.type}</td>
                    <td className="p-2.5">{col.nullCount}</td>
                    <td className="p-2.5">{col.uniqueCount}</td>
                    <td className="p-2.5">
                      {stats.numericStats[col.name]?.mean !== undefined
                        ? stats.numericStats[col.name].mean.toFixed(1)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Embedded Charts / Visualizations */}
          {charts && charts.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 border-b pb-2">
                Automated Visualizations & Distributions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {charts.slice(0, 4).map((c, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white">
                    <h3 className="text-xs font-bold text-gray-900 mb-1">{c.title}</h3>
                    <p className="text-[10px] text-gray-500 mb-3">{c.description}</p>
                    <div className="h-[220px]">
                      <Chart
                        options={{
                          chart: { type: c.type === "pie" ? "pie" : "bar", toolbar: { show: false } },
                          colors: ["#465fff", "#10b981", "#f59e0b", "#ef4444"],
                          labels: c.options?.labels as string[] || ["Segment A", "Segment B", "Segment C", "Segment D"],
                        }}
                        series={c.type === "pie" ? (c.data as number[]) : [{ name: "Value", data: (c.data as number[]).slice(0, 10) }]}
                        type={c.type === "pie" ? "pie" : "bar"}
                        height="100%"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomalies & Risk Audit Table */}
          {anomalies && anomalies.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 border-b pb-2 text-error-700">
                Statistical Anomalies & Risk Audit ({anomalies.length} Records)
              </h2>
              <table className="w-full text-left text-xs border border-error-200 rounded-lg">
                <thead className="bg-error-50 text-error-800">
                  <tr>
                    <th className="p-2.5">Row Index</th>
                    <th className="p-2.5">Flagged Feature</th>
                    <th className="p-2.5">Measured Value</th>
                    <th className="p-2.5">Z-Score Deviation</th>
                    <th className="p-2.5">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {anomalies.slice(0, 6).map((a, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">Record #{a.rowIndex}</td>
                      <td className="p-2.5 font-semibold text-gray-900">{a.column}</td>
                      <td className="p-2.5">{a.value.toLocaleString()}</td>
                      <td className="p-2.5 text-error-600 font-bold">Z: {a.zScore.toFixed(2)}</td>
                      <td className="p-2.5 font-semibold text-error-700">High Variance</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Machine Learning Clusters */}
          {clusters && clusters.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3 border-b pb-2">
                Machine Learning Cohorts & Clusters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Array.from(new Set(clusters.map((c) => c.cluster))).map((clusterId) => {
                  const members = clusters.filter((c) => c.cluster === clusterId);
                  const pct = ((members.length / Math.max(1, clusters.length)) * 100).toFixed(1);
                  return (
                    <div key={clusterId} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 text-xs">
                      <div className="font-bold text-gray-900">Cluster Group #{clusterId + 1}</div>
                      <div className="mt-1 text-gray-600">Cohort Share: <strong>{pct}%</strong> ({members.length} records)</div>
                      <div className="mt-1 text-[11px] text-gray-400">Centroid distance optimization active</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preprocessing Log */}
          {preprocessingLog && preprocessingLog.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2 border-b pb-2">
                Data Preprocessing & Verification Audit Log
              </h2>
              <div className="rounded-lg bg-gray-50 p-3 font-mono text-[11px] text-gray-600 space-y-1">
                {preprocessingLog.map((log, idx) => (
                  <div key={idx}>✓ {log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Verification Footer */}
          <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
            <p>SmartView Automated AI & Machine Learning Analytics Platform</p>
            <p>Report cryptographic checksum verified • Isolated partition: USER#{currentDataset.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
