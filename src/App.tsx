import { Route, Routes } from "react-router-dom";
import { BackupSettingsButton } from "./components/BackupSettingsButton";
import { Nav } from "./components/ui/Nav/Nav";
import JournalPage from "./pages/journal/JournalPage";
import InsightsPage from "./pages/insights/InsightsPage";

const NAV_ITEMS = [
  { to: "/", label: "寫日記/看日記", end: true },
  { to: "/dashboard", label: "數據統計看板" },
];

function App() {
  return (
    <div>
      <Nav items={NAV_ITEMS} aria-label="主導覽" trailing={<BackupSettingsButton />} />
      <main>
        <Routes>
          <Route path="/" element={<JournalPage />} />
          <Route path="/dashboard" element={<InsightsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
