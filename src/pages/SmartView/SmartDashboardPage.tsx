import { useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SmartDashboard from "../../components/smartview/dashboard/SmartDashboard";
import { useSmartView } from "../../context/SmartViewContext";

export default function SmartDashboardPage() {
  const { currentDataset } = useSmartView();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentDataset) {
      navigate("/upload", { replace: true });
    }
  }, [currentDataset, navigate]);

  if (!currentDataset) return null;

  return (
    <>
      <PageMeta
        title="Smart Dashboard | SmartView — AI-Powered Data Analytics"
        description="View your AI-powered data analysis results including KPIs, interactive charts, anomaly detection, clustering, trends, and insights."
      />
      <PageBreadCrumb pageTitle="Smart Dashboard" />
      <SmartDashboard />
    </>
  );
}
