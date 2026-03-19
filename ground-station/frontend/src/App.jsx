import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MissionsPage from './pages/MissionsPage';
import FlightCommandPage from './pages/FlightCommandPage';
import DirectCommandPage from './pages/DirectCommandPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black p-8 md:p-12">
        <Header />
        <Routes>
          <Route path="/" element={<MissionsPage />} />
          <Route path="/flight" element={<FlightCommandPage />} />
          <Route path="/command" element={<DirectCommandPage />} />
        </Routes>
        <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-spacex-white-10">
          <p className="text-center text-xs text-spacex-white-30 tracking-wider">
            © 2026 Soft Touch. All Rights Reserved.
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
