import { NavLink, Route, Routes } from "react-router-dom";
import JournalPage from "./pages/JournalPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <div>
      <nav aria-label="主導覽">
        <NavLink to="/">寫日記/看日記</NavLink>
        <NavLink to="/dashboard">數據統計看板</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<JournalPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
