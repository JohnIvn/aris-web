import "./App.css";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import { useAuthStore } from "./lib/stores/auth.store";

import MainLayout from "./pages/MainLayout";
import LandingPage from "./pages/LandingPage";
import PlaceReport from "./pages/PlaceReport";
import ScanningReport from "./pages/ScanningReport";
import SuccessReport from "./pages/SuccessReport";

// Landing Route Navigation (On Touch)
const LandingRoute = () => {
  const navigate = useNavigate();
  
  return (
    <LandingPage
      onTouch={() => navigate("/place-report")}
    />
  )
}

// Place Report Navigation (On Document Place)
const PlaceReportRoute = () => {
  const navigate = useNavigate();

  // Remove this after we have hardware
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/scanning-report");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PlaceReport
      onPlace={() => navigate("/scanning-report")}
    />
  )
}

// Scanning Reports Done (Failure or Success)
const ScanningReportRoute = () => {
  const navigate = useNavigate();

  const handleComplete = (success: boolean) => {
    if (success) {
      navigate("/success-report");
    } else {
      navigate("/fail-report");
    }
  };

  return (
    <ScanningReport
      onComplete={handleComplete}
    />
  );
};

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/place-report" element={<PlaceReportRoute />} />
          <Route path="/scanning-report" element={<ScanningReportRoute />} />
          <Route path="/success-report" element={<SuccessReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;