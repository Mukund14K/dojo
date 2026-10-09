import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import ProjectOverview from "./pages/ProjectOverview"
import Arena from "./pages/Arena"
import AttackEvolution from "./pages/AttackEvolution"
import Vulnerabilities from "./pages/Vulnerabilities"
import Patches from "./pages/Patches"
import Benchmarks from "./pages/Benchmarks"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import Landing from "./pages/Landing"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectOverview />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/evolution" element={<AttackEvolution />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/patches" element={<Patches />} />
          <Route path="/benchmarks" element={<Benchmarks />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
