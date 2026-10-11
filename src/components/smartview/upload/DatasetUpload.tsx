import { useSmartView } from "@/context/SmartViewContext";
import type { Dataset } from "@/context/SmartViewContext";
import { runFullAnalysis } from "@/utils/mlEngine";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";

type ParsedRow = Record<string, unknown>;

// Stored parsed rows — avoids mutating the File object
const parsedRowsStore = { current: null as ParsedRow[] | null };

// ─── CSV Parser ───────────────────────────────────────────────────────────────
function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas
    const fields: string[] = [];
    let current = "";
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { fields.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    fields.push(current.trim());
    const row: ParsedRow = {};
    headers.forEach((h, i) => { row[h] = fields[i] ?? null; });
    return row;
  });
}

// ─── Excel Parser (basic XLSX via xlsx library workaround — pure JS) ──────────
async function parseExcel(file: File): Promise<ParsedRow[]> {
  // We use a dynamic import of SheetJS (xlsx) if available, otherwise fall back to CSV-like
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const XLSX = await import("xlsx" as any);
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { defval: null }) as ParsedRow[];
  } catch {
    throw new Error("Could not parse Excel file. Please convert to CSV and try again.");
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const ACCEPTED = [".csv", ".xlsx", ".xls"];
const MAX_MB = 20;

export default function DatasetUpload() {
  const { setDataset, setAnalysisProgress, setIsAnalyzing, user } = useSmartView();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: ParsedRow[] } | null>(null);
  const [parseError, setParseError] = useState("");
  const [analysisStep, setAnalysisStep] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = useCallback(async (f: File) => {
    setParseError("");
    setPreview(null);

    const ext = f.name.toLowerCase().split(".").pop();
    const isAccepted = ACCEPTED.some((validExt) => f.name.toLowerCase().endsWith(validExt));
    if (!isAccepted) {
      setParseError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setParseError(`File is too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }

    setFile(f);

    try {
      let rows: ParsedRow[] = [];
      if (ext === "csv") {
        const text = await f.text();
        rows = parseCSV(text);
      } else {
        rows = await parseExcel(f);
      }

      if (rows.length === 0) {
        setParseError("The file appears to be empty or has no data rows.");
        return;
      }

      parsedRowsStore.current = rows;
      const headers = Object.keys(rows[0]);
      setPreview({ headers, rows: rows.slice(0, 10) });
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse file.");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const runAnalysis = async () => {
    if (!file) return;
    const rows = parsedRowsStore.current;
    if (!rows || rows.length === 0) { setParseError("No data found in file."); return; }

    setIsRunning(true);
    setIsAnalyzing(true);
    setProgress(0);

    try {
      const result = await runFullAnalysis(rows, file.name, (step, pct) => {
        setAnalysisStep(step);
        setProgress(pct);
        setAnalysisProgress(pct);
      });

      const dataset: Dataset = {
        id: `ds_${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        uploadedAt: new Date().toISOString(),
        ...result,
      };

      setDataset(dataset);
      setIsAnalyzing(false);
      navigate("/smart-dashboard");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Analysis failed.");
      setIsRunning(false);
      setIsAnalyzing(false);
    }
  };

  const handleLoadIndustrialSample = async () => {
    try {
      const response = await fetch('/Industrial_IoT_Equipment_Telemetry_2025.csv');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const sampleFile = new File([blob], 'Industrial_IoT_Equipment_Telemetry_2025.csv', { type: 'text/csv' });
      handleFile(sampleFile);
    } catch (err) {
      console.error("Failed to load sample industrial file:", err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          Upload Dataset
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload your CSV or Excel file. SmartView will automatically clean, analyse, and visualise your data.
        </p>
      </div>

      {/* Industrial Dataset Sample Quick Access */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 shadow-2xs dark:border-brand-900/40 dark:bg-brand-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-xs">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              Industrial IoT Telemetry Dataset (850 Records)
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              15 features: Vibration, Pressure, Temperature, kW, Throughput, and Risk Anomalies
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLoadIndustrialSample}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-600 shrink-0"
        >
          <span>⚡ 1-Click Load Industrial Data</span>
        </button>
      </div>

      {/* Drop Zone */}
      <div
        id="upload-dropzone"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
          dragOver
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
            : file && preview
            ? "border-success-400 bg-success-50 dark:bg-success-900/10"
            : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-600"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          id="file-upload-input"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />

        {file && preview ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-100 dark:bg-success-900/30">
                <svg className="h-7 w-7 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-start">
                <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB · {preview.rows.length}+ rows · {preview.headers.length} columns
                </p>
              </div>
            </div>
            <p className="text-sm text-success-600 dark:text-success-400">File parsed successfully — click to change</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${dragOver ? "bg-brand-100 dark:bg-brand-900/40" : "bg-gray-100 dark:bg-gray-800"}`}>
                <svg className={`h-8 w-8 ${dragOver ? "text-brand-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                {dragOver ? "Drop your file here" : "Drag & drop or click to upload"}
              </p>
              <p className="mt-1 text-sm text-gray-400">Supports CSV, XLSX, XLS · Max {MAX_MB} MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {parseError && (
        <div id="upload-error" className="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 px-4 py-3 dark:border-error-800 dark:bg-error-900/20">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-error-700 dark:text-error-400">{parseError}</p>
        </div>
      )}

      {/* Preview Table */}
      {preview && !isRunning && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Data Preview</h3>
              <p className="text-xs text-gray-500">Showing first 10 rows · {preview.headers.length} columns detected</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              Preview
            </span>
          </div>
          <div className="overflow-x-auto">
            <table id="preview-table" className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {preview.headers.map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/50 ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/20"}`}>
                    {preview.headers.map((h) => (
                      <td key={h} className="max-w-[180px] truncate whitespace-nowrap px-4 py-2.5 text-gray-700 dark:text-gray-300">
                        {row[h] === null || row[h] === undefined ? (
                          <span className="italic text-gray-300 dark:text-gray-600">null</span>
                        ) : (
                          String(row[h])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis Progress */}
      {isRunning && (
        <div id="analysis-progress" className="rounded-2xl border border-brand-200 bg-white p-6 dark:border-brand-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
              <svg className="h-6 w-6 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">SmartView AI is analysing your data</p>
              <p className="text-sm text-brand-500">{analysisStep}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Steps */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {[
              { label: "Preprocessing", pct: 25 },
              { label: "Statistics", pct: 40 },
              { label: "AI/ML Analysis", pct: 70 },
              { label: "Insights", pct: 94 },
            ].map((step) => (
              <div
                key={step.label}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 ${progress >= step.pct ? "text-brand-600 dark:text-brand-400" : "text-gray-400"}`}
              >
                {progress >= step.pct ? (
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-300 dark:border-gray-600" />
                )}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {preview && !isRunning && (
        <div className="flex items-center gap-3">
          <button
            id="run-analysis-btn"
            onClick={runAnalysis}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Run SmartView Analysis
          </button>
          <button
            id="clear-upload-btn"
            onClick={() => { setFile(null); setPreview(null); setParseError(""); parsedRowsStore.current = null; }}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Clear
          </button>
        </div>
      )}

      {/* Info Cards */}
      {!file && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "🔒",
              title: "Privacy First",
              desc: "All analysis runs locally in your browser. Your data never leaves your device.",
            },
            {
              icon: "⚡",
              title: "Instant Results",
              desc: "Automatic preprocessing, ML analysis, and smart chart selection — no configuration needed.",
            },
            {
              icon: "📊",
              title: "Rich Insights",
              desc: "KPIs, anomaly detection, clustering, trend analysis, and AI-powered recommendations.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 text-2xl">{card.icon}</div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{card.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      )}

      {user && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          Logged in as <span className="font-medium text-gray-600 dark:text-gray-400">{user.name}</span>
        </p>
      )}
    </div>
  );
}
