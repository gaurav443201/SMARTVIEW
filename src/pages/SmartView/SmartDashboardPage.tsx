import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import SmartDashboard from "@/components/smartview/dashboard/SmartDashboard";

export default function SmartDashboardPage() {
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
