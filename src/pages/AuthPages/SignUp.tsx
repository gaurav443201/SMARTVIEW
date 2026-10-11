import PageMeta from "@/components/common/PageMeta";
import SmartViewSignUpForm from "@/components/smartview/auth/SmartViewSignUpForm";
import AuthLayout from "./AuthPageLayout";

export default function SmartViewSignUp() {
  return (
    <>
      <PageMeta
        title="Create Account | SmartView — AI-Powered Data Analytics"
        description="Create your SmartView account to start analysing data with AI-powered insights, visualisations, and recommendations."
      />
      <AuthLayout>
        <SmartViewSignUpForm />
      </AuthLayout>
    </>
  );
}
