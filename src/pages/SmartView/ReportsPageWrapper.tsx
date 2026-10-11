import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import ReportsPage from "@/components/smartview/reports/ReportsPage";

export default function ReportsPageWrapper() {
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
