import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
