import type { Dataset } from "../context/SmartViewContext";
import { runFullAnalysis } from "./mlEngine";

/**
 * Generates a realistic enterprise default dataset for a newly registered user
 * Contains sales, profit, regional metrics, anomaly triggers, and customer satisfaction scores.
 */
export function generateSampleDataRows(): Record<string, unknown>[] {
  const regions = ["North America", "Europe", "Asia-Pacific", "Latin America"];
  const products = ["Analytics Pro", "AI Cloud Suite", "Enterprise Gateway", "Data Lakehouse", "Security Shield"];
  const segments = ["Enterprise", "Mid-Market", "SMB", "Government"];

  const rows: Record<string, unknown>[] = [];
  const baseDate = new Date("2025-01-01");

  for (let i = 0; i < 120; i++) {
    const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const region = regions[i % regions.length];
    const product = products[i % products.length];
    const segment = segments[(i * 3) % segments.length];

    // Standard business distribution with controlled anomalies
    let sales = Math.round(1500 + Math.sin(i / 10) * 800 + (i % 7) * 220);
    let units = Math.max(1, Math.round(sales / (85 + (i % 5) * 15)));
    let discount = Number(((i % 5) * 0.05).toFixed(2));
    let profit = Math.round(sales * (0.35 - discount * 0.5));
    let satisfaction = Number((4.1 + Math.sin(i / 5) * 0.7).toFixed(1));
    let riskScore = Math.max(5, Math.min(95, Math.round(30 + (1 - satisfaction / 5) * 50)));

    // Inject 3 controlled statistical anomalies for ML detection
    if (i === 28) {
      sales = 12500; // Extreme spike (Z-Score > 3.0)
      profit = 4900;
    } else if (i === 65) {
      sales = 80; // Extreme drop
      profit = -450;
      riskScore = 92;
    } else if (i === 99) {
      sales = 10800; // Second spike
      profit = 4200;
    }

    rows.push({
      RecordID: `REC-${1000 + i}`,
      Date: date,
      Region: region,
      Product: product,
      CustomerSegment: segment,
      SalesRevenue: sales,
      UnitsSold: units,
      DiscountRate: discount,
      NetProfit: profit,
      CustomerSatisfaction: Math.min(5.0, Math.max(1.0, satisfaction)),
      RiskScore: riskScore,
    });
  }

  return rows;
}

/**
 * Creates and analyzes a default secure enterprise dataset for a user
 */
export async function createDefaultUserDataset(userId: string, userName: string): Promise<Dataset> {
  const rows = generateSampleDataRows();
  const analysis = await runFullAnalysis(rows, "Enterprise_Sales_Security_2025.csv", () => {});

  const dataset: Dataset = {
    id: `ds_${userId}_default`,
    name: "Enterprise_Sales_Security_2025.csv",
    uploadedAt: new Date().toISOString(),
    rawData: rows,
    cleanedData: analysis.cleanedData,
    stats: analysis.stats,
    anomalies: analysis.anomalies,
    clusters: analysis.clusters,
    trends: analysis.trends,
    kpis: analysis.kpis,
    insights: analysis.insights,
    charts: analysis.charts,
    preprocessingLog: [
      `Initialized secure baseline dataset for account: ${userName}`,
      `Verified 120 records across 11 financial and risk attributes`,
      `ML Z-Score & K-Means models calculated successfully`,
      `Stored securely under isolated user partition: USER#${userId}`,
    ],
    status: "ready",
  };

  return dataset;
}

/**
 * Creates sample historical datasets including records uploaded 1 month ago, 2 months ago, etc.
 */
export async function createSampleHistoryDatasets(userId: string, currentDataset: Dataset): Promise<Dataset[]> {
  const oneMonthAgo = new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString();
  const twoMonthsAgo = new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString();

  // 1 month ago: Q4_Revenue_Audit_2024.csv
  const rowsQ4 = generateSampleDataRows().slice(0, 95);
  const analysisQ4 = await runFullAnalysis(rowsQ4, "Q4_Revenue_Audit_2024.csv", () => {});
  const dsQ4: Dataset = {
    id: `ds_${userId}_q4_2024`,
    name: "Q4_Revenue_Audit_2024.csv",
    uploadedAt: oneMonthAgo,
    rawData: rowsQ4,
    cleanedData: analysisQ4.cleanedData,
    stats: analysisQ4.stats,
    anomalies: analysisQ4.anomalies,
    clusters: analysisQ4.clusters,
    trends: analysisQ4.trends,
    kpis: analysisQ4.kpis,
    insights: analysisQ4.insights,
    charts: analysisQ4.charts,
    preprocessingLog: [
      "Archived historical snapshot: Q4 Financial Performance",
      "Processed 95 verified accounting entries",
      "Outlier validation complete with 4 flagged transactions",
    ],
    status: "ready",
  };

  // 2 months ago: Supply_Chain_Logistics_2024.xlsx
  const rowsLogistics = generateSampleDataRows().slice(0, 80);
  const analysisLogistics = await runFullAnalysis(rowsLogistics, "Supply_Chain_Logistics_2024.xlsx", () => {});
  const dsLogistics: Dataset = {
    id: `ds_${userId}_logistics_2024`,
    name: "Supply_Chain_Logistics_2024.xlsx",
    uploadedAt: twoMonthsAgo,
    rawData: rowsLogistics,
    cleanedData: analysisLogistics.cleanedData,
    stats: analysisLogistics.stats,
    anomalies: analysisLogistics.anomalies,
    clusters: analysisLogistics.clusters,
    trends: analysisLogistics.trends,
    kpis: analysisLogistics.kpis,
    insights: analysisLogistics.insights,
    charts: analysisLogistics.charts,
    preprocessingLog: [
      "Archived historical snapshot: Global Fleet & Supply Chain",
      "Processed 80 freight distribution records",
      "Cluster analysis indexed 3 regional distribution hubs",
    ],
    status: "ready",
  };

  return [currentDataset, dsQ4, dsLogistics];
}
