import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react'
import './index.css'

// Lazy load components for performance
const AdminView = lazy(() => import('./components/AdminView'));
const GuestView = lazy(() => import('./components/GuestView'));
const BettingPage = lazy(() => import('./components/BettingPage'));
const FeedbackPage = lazy(() => import('./components/FeedbackPage'));
const PartyShootingView = lazy(() => import('./components/PartyShootingView'));
const HallOfFame = lazy(() => import('./components/HallOfFame'));
const ShootingRemote = lazy(() => import('./components/ShootingRemote'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const BeerPongAdmin = lazy(() => import('./components/BeerPongAdmin'));
const BeerPongTV = lazy(() => import('./components/BeerPongTV'));
import DashboardLayout from './components/DashboardLayout'

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
  </div>
);

// Main App Component with Router
function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomeHandler />} />
          <Route path="/admin/hall-of-fame" element={
            <DashboardLayout title="Hall of Fame">
              <HallOfFame />
            </DashboardLayout>
          } />
          <Route path="/betting/:id" element={<BettingPage />} />
          <Route path="/feedback/:eventId" element={<FeedbackPage />} />
          <Route path="/party/:eventId/shooting" element={<PartyShootingView />} />
          <Route path="/admin/shooting-remote/:eventId" element={<ShootingRemote />} />
          <Route path="/admin/settings" element={
            <DashboardLayout title="Einstellungen">
              <SettingsPage />
            </DashboardLayout>
          } />
          <Route path="/admin/beerpong" element={<DashboardLayout title="Bierpong"><BeerPongAdmin /></DashboardLayout>} />
          <Route path="/party/beerpong" element={<BeerPongTV />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

// Sub-component to handle the legacy query param logic or standard views
// Sub-component to handle the query param logic
import { useSearchParams } from 'react-router-dom';

function HomeHandler() {
  const [searchParams] = useSearchParams();
  let partyId = searchParams.get('partyId');

  // Fallback: If React Router doesn't parse it (sometimes happens with HashRouter and certain redirect flows),
  // try to manually parse the hash string. 
  // Example hash: "#/?partyId=123" or "#/event?partyId=123"
  if (!partyId) {
    const hash = window.location.hash;
    if (hash.includes('partyId=')) {
      const match = hash.match(/partyId=([^&]*)/);
      if (match && match[1]) {
        partyId = match[1];
      }
    }
  }

  return (
    <div className="app-root">
      {partyId ? <GuestView partyId={partyId} /> : <AdminView />}
    </div>
  );
}

export default App
