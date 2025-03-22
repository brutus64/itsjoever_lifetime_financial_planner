import LandingPage from './components/LandingPage';
import ScenarioPage from './components/ScenarioPage';
import AppLayout from './components/Navigation/AppLayout';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route path="scenario" element={<ScenarioPage />} />
          {/* ADD YOUR NEW ROUTES HERE - HEADER/MENU WILL BE AUTOMATICALLY SHOWN */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
