import { useState, useEffect } from 'react'
import './index.css'
import AdminView from './components/AdminView'
import GuestView from './components/GuestView'

function App() {
  const [partyId, setPartyId] = useState(null);

  useEffect(() => {
    // Check for partyId in URL query parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get('partyId');
    if (id) {
      setPartyId(id);
    }
  }, []);

  return (
    <div className="app-root">
      {partyId ? <GuestView partyId={partyId} /> : <AdminView />}
    </div>
  )
}

export default App
