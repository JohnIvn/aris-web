import "./App.css";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { useAuthStore } from "./lib/stores/auth.store";

import MainLayout from "./pages/MainLayout";
import LandingPage from "./pages/LandingPage";
import PlaceReport from "./pages/PlaceReport";
import ScanningReport from "./pages/ScanningReport";

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/place-report" element={<PlaceReport />} />
          <Route path="/scanning-report" element={<ScanningReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;