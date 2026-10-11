import { useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ReportsPage from "../../components/smartview/reports/ReportsPage";
import { useSmartView } from "../../context/SmartViewContext";

export default function ReportsPageWrapper() {
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
        title="Reports | SmartView — AI-Powered Data Analytics"
        description="Download your SmartView analysis report with all insights, KPIs, and recommendations."
      />
      <PageBreadCrumb pageTitle="Analysis Report" />
      <ReportsPage />
    </>
  );
}
