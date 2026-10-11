import PageMeta from "@/components/common/PageMeta";
import SmartViewSignInForm from "@/components/smartview/auth/SmartViewSignInForm";
import AuthLayout from "./AuthPageLayout";

export default function SmartViewSignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | SmartView — AI-Powered Data Analytics"
        description="Sign in to your SmartView account to access AI-powered data analysis, visualisations, and insights."
      />
      <AuthLayout>
        <SmartViewSignInForm />
      </AuthLayout>
    </>
  );
}
