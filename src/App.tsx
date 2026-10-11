import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { SmartViewProvider } from "./context/SmartViewContext";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Home from "./pages/Dashboard/Ecommerce";
import NotFound from "./pages/OtherPage/NotFound";
import SmartDashboardPage from "./pages/SmartView/SmartDashboardPage";
import UploadPage from "./pages/SmartView/UploadPage";
import ReportsPageWrapper from "./pages/SmartView/ReportsPageWrapper";
import AiInsightsPage from "./pages/SmartView/AiInsightsPage";
import HistoryPage from "./pages/SmartView/HistoryPage";

export default function App() {
  return (
    <SmartViewProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* SmartView Core Routes */}
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/smart-dashboard" element={<SmartDashboardPage />} />
            <Route path="/ai-insights" element={<AiInsightsPage />} />
            <Route path="/reports" element={<ReportsPageWrapper />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </SmartViewProvider>
  );
}
