import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import ScenarioPage from './components/ScenarioPage';
import Scenario from './components/scenario/Scenario';
import SharedPage from './components/SharedPage';
import ExplorationPage from './components/ExplorationPage';
import SimulationLogPage from './components/SimulationLogPage';
import AppLayout from './components/Navigation/AppLayout';
import ScenarioForm from './components/scenario/ScenarioForm';
import { Route, Routes, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route path="scenario" element={<ScenarioPage />} />
          <Route path="/scenario/:id" element={<Scenario />} />
          <Route path="/exploration" element={<ExplorationPage/>}/>
          <Route path="/simulation" element={<SimulationLogPage/>}/>
          <Route path="/shared" element={<SharedPage/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/scenario/new" element={<ScenarioForm/>}/>
          {/* ADD YOUR NEW ROUTES HERE - HEADER/MENU WILL BE AUTOMATICALLY SHOWN */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
