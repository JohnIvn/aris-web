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

// Documents
import PlaceReport from "./pages/PlaceReport";
import ScanningReport from "./pages/ScanningReport";
import SuccessReport from "./pages/SuccessReport";
import FailureReport from "./pages/FailureReport";

// Finger
import ScanFinger from "./pages/ScanFinger";

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
      navigate("/failure-report");
    }
  };

  return (
    <ScanningReport
      onComplete={handleComplete}
    />
  );
};

// Success Report -> On Continue
const SuccessReportRoute = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/scan-finger")
  }

  return (
    <SuccessReport 
      onContinue={handleContinue}
    />
  )
}
// Failure Report -> On Continue
const FailureReportRoute = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/place-report")
  }

  return (
    <FailureReport 
      onRetry={handleContinue}
    />
  )
}

// Scan Finger 
const ScanFingerRoute = () => {
  const navigate = useNavigate()

  const handleScan = () => {

  }

  return (
    <ScanFinger 
      onScan={handleScan}
    />
  )
}

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
          <Route path="/success-report" element={<SuccessReportRoute />} />
          <Route path="/failure-report" element={<FailureReportRoute />} />
          <Route path="/scan-finger" element={<ScanFingerRoute />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;