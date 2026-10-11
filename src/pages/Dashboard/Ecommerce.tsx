import PageMeta from "@/components/common/PageMeta";
import { useSmartView } from "@/context/SmartViewContext";
import { Link, useNavigate } from "react-router";

export default function SmartViewHome() {
  const { user, currentDataset, datasetHistory } = useSmartView();
  const navigate = useNavigate();

  const features = [
    { icon: "📂", title: "Dataset Upload", desc: "Upload CSV or Excel files with instant preview & integrity checks.", route: "/upload" },
    { icon: "🔧", title: "Auto Preprocessing", desc: "Detect and clean missing values, duplicates, and column types.", route: "/smart-dashboard" },
    { icon: "📊", title: "Exploratory EDA", desc: "Statistical summaries, distributions, and correlation matrices.", route: "/smart-dashboard" },
    { icon: "📈", title: "Smart Visuals", desc: "Automated histograms, scatter plots, trend lines, and heatmaps.", route: "/smart-dashboard" },
    { icon: "🤖", title: "ML Anomaly Engine", desc: "Z-Score and IQR outlier flagging to spot risks & defects.", route: "/smart-dashboard" },
    { icon: "🎯", title: "K-Means Clusters", desc: "Unsupervised cohort segmentation with auto-tuned k-clusters.", route: "/smart-dashboard" },
    { icon: "💡", title: "Executive Insights", desc: "Auto-generated findings, KPIs, and actionable guidance.", route: "/smart-dashboard" },
    { icon: "📄", title: "Report Export", desc: "Export publication-ready comprehensive HTML analytical reports.", route: "/reports" },
  ];

  return (
    <>
      <PageMeta
        title="Home | SmartView — AI-Powered Data Analytics"
        description="SmartView is an AI-powered data analytics platform that automatically analyses your datasets, detects patterns, and generates insights."
      />
      <div className="space-y-5">
        {/* Compact Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 md:p-7 text-white shadow-lg">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-10 end-20 h-40 w-40 rounded-full bg-cyan-400/10 blur-xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="max-w-xl">
              <div className="mb-1.5 flex items-center gap-2 text-brand-200 text-xs font-medium">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI-Powered · Real-Time Browser ML · Zero Code</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
              </h1>
              <p className="mt-1.5 text-xs md:text-sm text-brand-100/90 leading-relaxed">
                Upload any CSV or Excel dataset to automatically clean records, run machine learning algorithms, and view executive visualizations.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
              <button
                id="home-upload-btn"
                onClick={() => navigate("/upload")}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 shadow-md transition-all hover:bg-brand-50 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Dataset
              </button>
              {currentDataset && (
                <button
                  id="home-dashboard-btn"
                  onClick={() => navigate("/smart-dashboard")}
                  className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-95"
                >
                  Open Dashboard →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current dataset active banner */}
        {currentDataset && (
          <div className="flex items-center justify-between rounded-xl border border-success-200 bg-success-50/80 px-4 py-3 dark:border-success-800/60 dark:bg-success-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-success-900 dark:text-success-200">
                  Active Dataset: <span className="font-mono text-success-700 dark:text-success-400">{currentDataset.name}</span>
                </p>
                <p className="text-[11px] text-success-600 dark:text-success-400">
                  {currentDataset.stats.rowCount.toLocaleString()} rows · {currentDataset.stats.colCount} columns · {currentDataset.anomalies.length} outliers detected
                </p>
              </div>
            </div>
            <Link
              to="/smart-dashboard"
              className="rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-success-700 transition"
            >
              View Results
            </Link>
          </div>
        )}

        {/* Quick Stats Grid if dataset exists */}
        {currentDataset && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: "📊", label: "Rows Analysed", value: currentDataset.stats.rowCount.toLocaleString() },
              { icon: "🔍", label: "Anomalies", value: currentDataset.anomalies.length },
              { icon: "🎯", label: "Clusters", value: new Set(currentDataset.clusters.map((c) => c.cluster)).size },
              { icon: "✅", label: "Completeness", value: `${currentDataset.stats.completeness}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-2xs dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <span className="block text-base font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  <span className="block text-[11px] text-gray-400">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modules Grid */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              SmartView Core Capabilities
            </h2>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">8 Integrated Modules</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.route}
                className="group rounded-xl border border-gray-100 bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xs dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
              >
                <div className="mb-2 text-2xl">{f.icon}</div>
                <h3 className="text-xs font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {f.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Dataset History */}
        {datasetHistory.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Recent Analysis Sessions
            </h2>
            <div className="space-y-1.5">
              {datasetHistory.slice(0, 3).map((ds) => (
                <div
                  key={ds.id}
                  className="flex items-center justify-between rounded-lg border border-gray-50 bg-gray-50/70 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span>📁</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{ds.name}</span>
                    <span className="text-[10px] text-gray-400">({new Date(ds.uploadedAt).toLocaleDateString()})</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    {ds.stats.rowCount} rows · {ds.stats.colCount} cols
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="pt-1 text-center text-[10px] text-gray-400 dark:text-gray-600">
          SmartView is an academic prototype for automated exploratory analytics.
        </p>
      </div>
    </>
  );
}
