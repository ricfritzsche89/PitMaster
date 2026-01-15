import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'
import './index.css'
import AdminView from './components/AdminView'
import GuestView from './components/GuestView'
import BettingPage from './components/BettingPage'

// Main App Component with Router
function App() {
  return (
    <Router basename="/PitMaster">
      <Routes>
        <Route path="/" element={<HomeHandler />} />
        <Route path="/betting/:id" element={<BettingPage />} />
      </Routes>
    </Router>
  )
}

// Sub-component to handle the legacy query param logic or standard views
function HomeHandler() {
  const [partyId, setPartyId] = useState(null);

  useEffect(() => {
    // Check URL params for manual overrides if needed, or if link was shared with ?partyId
    const params = new URLSearchParams(window.location.search);
    const id = params.get('partyId');
    if (id) setPartyId(id);
  }, []);

  return (
    <div className="app-root">
      {partyId ? <GuestView partyId={partyId} /> : <AdminView />}
    </div>
  );
}

export default App
