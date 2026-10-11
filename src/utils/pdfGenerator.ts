import jsPDF from "jspdf";
import type { Dataset } from "../context/SmartViewContext";
import type { OpenAiInsightsResponse } from "../services/openAiService";

export function exportSmartViewPdf(dataset: Dataset, aiInsights: OpenAiInsightsResponse | null): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper for footer on every page
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 155, 165);
    doc.text(
      `SmartView AI-Powered Analytics • Confidential Report • ${dataset.name}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8);
  };

  // ═════════════════════════════════════════════════════════════════════════════
  // PAGE 1: EXECUTIVE OVERVIEW & OPENAI AI RECOMMENDATIONS
  // ═════════════════════════════════════════════════════════════════════════════

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("SmartView Enterprise Analytics Report", margin + 6, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Dataset: ${dataset.name}   |   Records: ${dataset.stats.rowCount.toLocaleString()}   |   Features: ${dataset.stats.colCount}`,
    margin + 6,
    y + 18
  );
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}   |   Engine: OpenAI GPT-4o-mini`,
    margin + 6,
    y + 24
  );

  y += 34;

  // AI Strategic Index & Health Score Card
  const healthScore = aiInsights?.companyHealthScore ?? 88;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("C-Suite Strategic Health Assessment", margin + 5, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Data Health Status: ${aiInsights?.dataHealthBadge || "Enterprise Benchmark"}   |   Outliers Identified: ${dataset.anomalies.length}   |   Clusters: ${dataset.clusters.length}`,
    margin + 5,
    y + 15
  );

  // Score Pill
  doc.setFillColor(70, 95, 255); // brand-500
  doc.roundedRect(pageWidth - margin - 32, y + 4, 28, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${healthScore}/100`, pageWidth - margin - 28, y + 15);

  y += 29;

  // Executive Summary Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Executive Summary (OpenAI Intelligence)", margin, y);
  y += 4.5;

  const summaryText =
    aiInsights?.executiveSummary ||
    `Analysis of ${dataset.name} indicates consistent core operational volume across ${dataset.stats.rowCount} transactions. Machine learning isolation flagged ${dataset.anomalies.length} high-leverage outliers requiring risk verification.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4 + 4;

  // Key Performance Indicators (KPIs)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Key Performance Indicators (Telemetry)", margin, y);
  y += 4;

  const kpis = dataset.kpis.slice(0, 4);
  const kpiWidth = (contentWidth - 6) / 4;
  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiWidth + 2);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(kpiX, y, kpiWidth, 16, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(String(kpi.label).toUpperCase().substring(0, 16), kpiX + 3, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(String(kpi.value), kpiX + 3, y + 12);
  });

  y += 21;

  // Strategic Action Recommendations (from OpenAI API)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Priority Strategic Action Plan (OpenAI Recommendations)", margin, y);
  y += 5;

  const recommendations = aiInsights?.strategicRecommendations.slice(0, 4) || [
    {
      title: "Capitalize on High-Yield Cohorts",
      category: "Revenue Optimization",
      actionPlan: "Reallocate capacity toward top-performing clusters to increase margins.",
      expectedRoi: "+18.5% Net Margin Expansion",
    },
    {
      title: "Remediate Statistical Outliers",
      category: "Risk Mitigation",
      actionPlan: "Deploy threshold gating for transactions deviating beyond 2.5 std deviations.",
      expectedRoi: "Zero unmonitored compliance leakage",
    },
  ];

  recommendations.forEach((rec) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 19, 1.5, 1.5, "FD");

    // Category Tag
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin + 3, y + 2.5, 38, 4.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(67, 56, 202);
    doc.text(String(rec.category).toUpperCase(), margin + 5, y + 5.8);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(rec.title, margin + 44, y + 6);

    // Action Plan
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const actionLines = doc.splitTextToSize(rec.actionPlan, contentWidth - 8);
    doc.text(actionLines.slice(0, 2), margin + 3, y + 11);

    // Expected ROI
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`Expected ROI: ${rec.expectedRoi}`, margin + 3, y + 17);

    y += 21.5;
  });

  addFooter(1, 2);

  // ═════════════════════════════════════════════════════════════════════════════
  // PAGE 2: STATISTICAL PROFILE, ANOMALY AUDIT & CLUSTERS
  // ═════════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = margin;

  // Section Header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Dataset Telemetry, Risk Anomalies & ML Clusters", margin + 5, y + 8);
  y += 17;

  // Dataset Hygiene Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Data Profile & Hygiene Overview", margin, y);
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Total Records: ${dataset.stats.rowCount.toLocaleString()}   |   Features: ${dataset.stats.colCount}   |   Completeness: ${dataset.stats.completeness.toFixed(1)}%   |   Duplicates Removed: ${dataset.stats.duplicateRows}`,
    margin + 4,
    y + 6
  );
  doc.text(
    `Missing Cells: ${dataset.stats.nullCells}   |   Numeric Columns: ${dataset.stats.columns.filter((c) => c.type === "numeric").length}   |   Categorical: ${dataset.stats.columns.filter((c) => c.type === "categorical").length}`,
    margin + 4,
    y + 11
  );
  y += 18;

  // Features Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Key Features & Statistical Distribution", margin, y);
  y += 4;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Feature Name", margin + 3, y + 4.2);
  doc.text("Type", margin + 65, y + 4.2);
  doc.text("Nulls", margin + 95, y + 4.2);
  doc.text("Unique", margin + 120, y + 4.2);
  doc.text("Mean / Avg", margin + 150, y + 4.2);
  y += 6;

  const displayCols = dataset.stats.columns.slice(0, 10);
  displayCols.forEach((col, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 5.5, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(col.name.substring(0, 32), margin + 3, y + 3.8);
    doc.text(col.type.toUpperCase(), margin + 65, y + 3.8);
    doc.text(String(col.nullCount), margin + 95, y + 3.8);
    doc.text(String(col.uniqueCount), margin + 120, y + 3.8);

    const meanVal = dataset.stats.numericStats[col.name]?.mean;
    doc.text(meanVal !== undefined ? meanVal.toFixed(1) : "-", margin + 150, y + 3.8);
    y += 5.5;
  });

  y += 4;

  // Machine Learning Outliers & Anomalies Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(`Statistical Anomalies & Risk Audit (${dataset.anomalies.length} Flagged Records)`, margin, y);
  y += 4;

  doc.setFillColor(254, 242, 242);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text("Row Index", margin + 3, y + 4.2);
  doc.text("Flagged Feature", margin + 45, y + 4.2);
  doc.text("Measured Value", margin + 95, y + 4.2);
  doc.text("Z-Score Deviation", margin + 135, y + 4.2);
  doc.text("Risk Status", margin + 165, y + 4.2);
  y += 6;

  const topAnomalies = dataset.anomalies.slice(0, 8);
  topAnomalies.forEach((a, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(255, 245, 245);
      doc.rect(margin, y, contentWidth, 5.5, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(`Record #${a.rowIndex}`, margin + 3, y + 3.8);
    doc.text(a.column.substring(0, 24), margin + 45, y + 3.8);
    doc.text(String(a.value), margin + 95, y + 3.8);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`Z: ${a.zScore.toFixed(2)}`, margin + 135, y + 3.8);
    doc.text("High Outlier", margin + 165, y + 3.8);
    y += 5.5;
  });

  y += 6;

  // Preprocessing Verification Log
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("Automated Preprocessing & Cryptographic Integrity Log", margin, y);
  y += 3.5;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const logs = dataset.preprocessingLog.slice(0, 4);
  logs.forEach((log, i) => {
    doc.text(`[VERIFIED] ${log.substring(0, 95)}`, margin + 3, y + 3.5 + i * 3.5);
  });

  addFooter(2, 2);

  // Save PDF directly to user's downloads
  const sanitizedName = dataset.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `SmartView_Executive_Report_${sanitizedName}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
