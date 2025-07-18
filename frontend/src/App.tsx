import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import ScenarioPage from './components/ScenarioPage';
import Scenario from './components/scenario/Scenario';
import SharedPage from './components/SharedPage';
import ExplorationPage from './components/ExplorationPage';
import SimulationLogPage from './components/SimulationLogPage';
import AppLayout from './components/Navigation/AppLayout';
import ScenarioForm from './components/scenario/ScenarioForm';
import SimulationResultPage from './components/SimulationResultPage';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { AuthProvider } from './components/Navigation/AuthContext';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
    <Routes>
        
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route path="scenario" element={<ScenarioPage />} />
          <Route path="/scenario/:id" element={<Scenario />} />
          <Route path="/simulation" element={<SimulationLogPage/>}/>
          <Route path="/shared" element={<SharedPage/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/scenario/:id/:page" element={<ScenarioForm/>}/>
          <Route path="/simulation_result" element={<SimulationResultPage/>}/>
          <Route path="/exploration_result" element={<ExplorationPage/>}>
        </Route>
          {/* ADD YOUR NEW ROUTES HERE - HEADER/MENU WILL BE AUTOMATICALLY SHOWN */}
        </Route>
      </Routes>
    </AuthProvider>
      
    </BrowserRouter>
  );
}

export default App
