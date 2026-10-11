import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useSmartView, type Dataset } from "../../context/SmartViewContext";
import { createSampleHistoryDatasets } from "../../utils/sampleDataset";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

export default function HistoryPage() {
  const { currentDataset, datasetHistory, loadDatasetFromHistory, deleteFromHistory, addToHistory } = useSmartView();
  const [search, setSearch] = useState("");
  const [selectedPreview, setSelectedPreview] = useState<Dataset | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (datasetHistory.length === 0 && currentDataset) {
      createSampleHistoryDatasets(currentDataset.id, currentDataset).then((list) => {
        list.forEach((ds) => addToHistory(ds));
      });
    }
  }, [datasetHistory.length, currentDataset, addToHistory]);

  const filteredHistory = datasetHistory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatUploadDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 60) return "1 month ago";
      if (diffDays < 90) return "2 months ago";
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
      return "Past Upload";
    }
  };

  const handleSelectDataset = (datasetId: string) => {
    loadDatasetFromHistory(datasetId);
    navigate("/smart-dashboard");
  };

  const handleExportCsv = (dataset: Dataset) => {
    const rows = dataset.cleanedData || dataset.rawData || [];
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${dataset.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRowsCount = datasetHistory.reduce((acc, d) => acc + (d.stats?.rowCount || 0), 0);

  return (
    <div className="space-y-6">
      <PageMeta
        title="Dataset History & Archive | SmartView — AI-Powered Data Analytics"
        description="Access and restore historical corporate datasets uploaded past months or earlier."
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Dataset History & Archive" />
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-brand-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Upload New Dataset
        </Link>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Datasets Archived</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{datasetHistory.length}</div>
          <div className="mt-1 text-[11px] text-brand-500">Persisted per-user partition</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Analyzed Records</div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {totalRowsCount.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-success-500">Cleaned & preprocessed</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Currently Active Dataset</div>
          <div className="mt-2 text-sm font-bold text-gray-900 truncate dark:text-white">
            {currentDataset?.name || "None selected"}
          </div>
          <div className="mt-1 text-[11px] text-gray-400">
            {currentDataset ? `${currentDataset.stats.rowCount} rows • ${currentDataset.anomalies.length} outliers` : "Upload to activate"}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search past datasets by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-xs text-gray-800 placeholder-gray-400 shadow-2xs transition focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredHistory.length} of {datasetHistory.length} saved datasets
        </div>
      </div>

      {/* Dataset History Cards / Table */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Datasets Found in History</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Uploaded datasets from previous sessions, past months, or historical audits appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((item) => {
            const isActive = currentDataset?.id === item.id;
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition hover:shadow-md ${
                  isActive
                    ? "border-brand-500 bg-brand-50/20 dark:border-brand-600 dark:bg-brand-950/20"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                          Active Now
                        </span>
                      )}
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {formatUploadDate(item.uploadedAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Rows: <strong className="text-gray-700 dark:text-gray-300">{item.stats.rowCount}</strong></span>
                      <span>Columns: <strong className="text-gray-700 dark:text-gray-300">{item.stats.colCount}</strong></span>
                      <span>Completeness: <strong className="text-success-600 dark:text-success-400">{item.stats.completeness.toFixed(1)}%</strong></span>
                      <span>Anomalies: <strong className="text-error-500">{item.anomalies.length}</strong></span>
                      <span>Clusters: <strong className="text-brand-500">{item.clusters.length}</strong></span>
                      <span className="text-[11px] text-gray-400">
                        Uploaded: {new Date(item.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleSelectDataset(item.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-2xs transition ${
                        isActive
                          ? "bg-brand-500 text-white hover:bg-brand-600"
                          : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      {isActive ? "View Dashboard" : "Set as Active"}
                    </button>

                    <button
                      onClick={() => setSelectedPreview(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      title="Quick Preview"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => handleExportCsv(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-2xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      title="Export CSV"
                    >
                      CSV
                    </button>

                    {datasetHistory.length > 1 && (
                      <button
                        onClick={() => deleteFromHistory(item.id)}
                        className="rounded-xl border border-gray-200 p-2 text-gray-400 transition hover:border-error-200 hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:hover:border-error-900 dark:hover:bg-error-950/20"
                        title="Delete from archive"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedPreview.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Uploaded {new Date(selectedPreview.uploadedAt).toLocaleString()} • {selectedPreview.stats.rowCount} records
                </p>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Sample Records
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {selectedPreview.stats.columns.slice(0, 6).map((col) => (
                          <th key={col.name} className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {(selectedPreview.cleanedData || selectedPreview.rawData || []).slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {selectedPreview.stats.columns.slice(0, 6).map((col) => (
                            <td key={col.name} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                              {String(row[col.name] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectDataset(selectedPreview.id);
                    setSelectedPreview(null);
                  }}
                  className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-brand-600"
                >
                  Activate Dataset & View Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
