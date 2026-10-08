import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Logo } from "./app/Logo";
import { About } from "./app/screens/About";
import { Home } from "./app/screens/Home";
import { Patrol } from "./app/screens/Patrol";
import { Report } from "./app/screens/Report";
import { PatrolProvider } from "./app/patrol-context";
import copy from "./i18n/copy.json";

export function App() {
  return (
    <PatrolProvider>
      <div className="app-shell">
        <header className="topbar">
          <Link className="brand" to="/">
            <Logo className="mark" />
            <span>
              <b>{copy.ui.appName.en}</b>
              <small className="km">{copy.ui.appName.km}</small>
            </span>
          </Link>
          <nav className="nav">
            <Link to="/about">{copy.ui.about.en}</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patrol" element={<Patrol />} />
          <Route path="/report" element={<Report />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <p className="footer-note">
          Built 9–11 Oct 2026 for DEV Hacktoberfest Week 1 · Touch Grass. Not
          medical advice.
        </p>
      </div>
    </PatrolProvider>
  );
}
