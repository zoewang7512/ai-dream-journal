import { Route, Routes } from "react-router-dom";
import { Nav } from "./components/ui/Nav/Nav";
import JournalPage from "./pages/journal/JournalPage";
import DashboardPage from "./pages/DashboardPage";

const NAV_ITEMS = [
  { to: "/", label: "寫日記/看日記", end: true },
  { to: "/dashboard", label: "數據統計看板" },
];

function App() {
  return (
    <div>
      <Nav items={NAV_ITEMS} aria-label="主導覽" />
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
