import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DatasetUpload from "../../components/smartview/upload/DatasetUpload";

export default function UploadPage() {
  return (
    <>
      <PageMeta
        title="Upload Dataset | SmartView — AI-Powered Data Analytics"
        description="Upload your CSV or Excel dataset. SmartView automatically preprocesses, analyses, and visualises your data with AI."
      />
      <PageBreadCrumb pageTitle="Upload Dataset" />
      <DatasetUpload />
    </>
  );
}
