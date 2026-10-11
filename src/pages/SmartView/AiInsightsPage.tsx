import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { useSmartView } from "@/context/SmartViewContext";
import { generateOpenAiInsights, type OpenAiInsightsResponse } from "@/services/openAiService";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function AiInsightsPage() {
  const { currentDataset } = useSmartView();
  const [insights, setInsights] = useState<OpenAiInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    if (currentDataset) {
      setLoading(true);
      generateOpenAiInsights(currentDataset)
        .then((res) => {
          setInsights(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [currentDataset?.id]);

  const handleRegenerate = async () => {
    if (!currentDataset) return;
    setLoading(true);
    try {
      const fresh = await generateOpenAiInsights(currentDataset, true);
      setInsights(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="space-y-6">
        <PageMeta
          title="AI Insights | SmartView — AI-Powered Data Analytics"
          description="AI-driven business recommendations, revenue optimizations, and strategic risk audits powered by OpenAI."
        />
        <PageBreadCrumb pageTitle="AI Insights & Recommendations" />
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Dataset Active</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Please upload a dataset or select one from history to generate executive AI recommendations.
          </p>
          <Link
            to="/upload"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-600"
          >
            Upload Dataset
          </Link>
        </div>
      </div>
    );
  }

  const categories = ["All", "Revenue Optimization", "Risk & Fraud Mitigation", "Operational Efficiency", "Customer Retention"];

  const filteredRecommendations =
    insights?.strategicRecommendations.filter((rec) => activeFilter === "All" || rec.category === activeFilter) || [];

  return (
    <div className="space-y-6">
      <PageMeta
        title="AI Insights | SmartView — AI-Powered Data Analytics"
        description="Executive business recommendations powered by OpenAI for corporate leadership."
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="AI Insights & Executive Recommendations" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 dark:border-success-900/40 dark:bg-success-950/30 dark:text-success-400">
            <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
            <span>OpenAI GPT-4o-mini Connected</span>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? "Analyzing Data with AI..." : "Regenerate AI Analysis"}</span>
          </button>
        </div>
      </div>

      {loading && !insights ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Consulting OpenAI Executive Intelligence Engine...
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Synthesizing {currentDataset.stats.rowCount} records, {currentDataset.anomalies.length} risk outliers, and {currentDataset.clusters.length} commercial clusters.
          </p>
        </div>
      ) : insights ? (
        <>
          {/* Executive Overview Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-brand-950 to-gray-900 p-6 text-white shadow-xl dark:border dark:border-gray-800">
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-500/20 px-3 py-0.5 text-xs font-semibold text-brand-300 border border-brand-500/30">
                    {insights.dataHealthBadge}
                  </span>
                  <span className="text-xs text-gray-400">
                    Dataset: <strong className="text-gray-200">{currentDataset.name}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  C-Suite Business Strategy Assessment
                </h2>
                <p className="text-xs leading-relaxed text-gray-300 md:text-sm">
                  {insights.executiveSummary}
                </p>
              </div>

              {/* Health Score Gauge */}
              <div className="shrink-0 flex items-center gap-4 rounded-xl bg-white/5 p-4 backdrop-blur-md border border-white/10">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-brand-400">
                    {insights.companyHealthScore}
                    <span className="text-sm font-normal text-gray-400">/100</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                    Strategic Index
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Model: <span className="font-semibold text-white">{insights.modelUsed}</span></div>
                  <div>Outliers: <span className="font-semibold text-error-400">{currentDataset.anomalies.length} Flagged</span></div>
                  <div>Clusters: <span className="font-semibold text-success-400">{currentDataset.clusters.length} Segments</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Target Trajectories */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  30-Day & 90-Day KPI Growth Targets
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Forecasted trajectory if recommended operational adjustments are executed
                </p>
              </div>
              <span className="text-xs font-medium text-brand-500">AI Projected Milestones</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {insights.kpiProjections.map((kpi, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-brand-300 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {kpi.metric}
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Current</div>
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{kpi.currentValue}</div>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <div>
                      <div className="text-[10px] text-brand-500 uppercase">30 Days</div>
                      <div className="text-sm font-bold text-brand-600 dark:text-brand-400">{kpi.target30Days}</div>
                    </div>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <div>
                      <div className="text-[10px] text-success-500 uppercase">90 Days</div>
                      <div className="text-sm font-bold text-success-600 dark:text-success-400">{kpi.target90Days}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                    {kpi.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk & Anomaly Warnings */}
          {insights.anomalyWarnings.length > 0 && (
            <div className="rounded-2xl border border-error-100 bg-error-50/40 p-5 dark:border-error-900/30 dark:bg-error-950/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-error-100 text-error-600 dark:bg-error-900/50 dark:text-error-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-error-900 dark:text-error-300">
                  Critical Outlier & Risk Warnings Detected by AI
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {insights.anomalyWarnings.map((warn, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-error-200/60 bg-white p-3.5 shadow-2xs dark:border-error-800/60 dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {warn.issue}
                      </span>
                      <span className="rounded-full bg-error-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-error-700 dark:bg-error-900/40 dark:text-error-300">
                        {warn.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <strong>Executive Directive:</strong> {warn.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Recommendations Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Strategic Action Plan for Company Growth
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tailored corporate initiatives categorized by business function
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`rounded-xl px-3 py-1 text-xs font-medium transition ${
                      activeFilter === cat
                        ? "bg-brand-500 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                        {rec.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === "High"
                            ? "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400"
                            : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {rec.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {rec.actionPlan}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Timeline: <strong className="text-gray-700 dark:text-gray-300">{rec.timeframe}</strong>
                    </span>
                    <span className="font-semibold text-success-600 dark:text-success-400">
                      ROI: {rec.expectedRoi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Segment Opportunities */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Segment Expansion Opportunities
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Cluster-level monetization opportunities identified from pattern recognition
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {insights.marketOpportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {opp.segment}
                    </span>
                    <span className="rounded-full bg-success-50 border border-success-200 px-2 py-0.5 text-[10px] font-bold text-success-600 dark:bg-success-950/30 dark:border-success-800 dark:text-success-400">
                      {opp.growthPotential}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    {opp.strategicTactic}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
