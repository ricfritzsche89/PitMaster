import React, { useState } from 'react';
import logo from '../assets/pitmaster_logo_transparent.png';
import './DashboardLayout.css';

export default function DashboardLayout({ children, title = "Dashboard", onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="brand" style={{ padding: '1rem 0', justifyContent: 'center', display: 'flex' }}>
                    <img
                        src={logo}
                        alt="PitMaster"
                        style={{
                            height: '50px',
                            objectFit: 'contain',
                            // mix-blend-mode removed: using true transparent PNG
                            filter: 'drop-shadow(0 0 5px rgba(29, 185, 84, 0.3))' // Adds subtle glow to the transparent logo
                        }}
                    />
                </div>

                <div className="radio-container">
                    <input
                        type="radio"
                        id="nav-events"
                        name="layout-nav"
                        defaultChecked={window.location.hash === '#/' || window.location.hash === ''}
                        onChange={() => window.location.hash = '#/'}
                    />
                    <label htmlFor="nav-events">
                        <span>📊</span> Events
                    </label>

                    <input
                        type="radio"
                        id="nav-hof"
                        name="layout-nav"
                        defaultChecked={window.location.hash.includes('hall-of-fame')}
                        onChange={() => window.location.hash = '#/admin/hall-of-fame'}
                    />
                    <label htmlFor="nav-hof">
                        <span>🏆</span> Hall of Fame
                    </label>

                    <input
                        type="radio"
                        id="nav-settings"
                        name="layout-nav"
                        defaultChecked={window.location.hash.includes('settings')}
                        onChange={() => window.location.hash = '#/admin/settings'}
                    />
                    <label htmlFor="nav-settings">
                        <span>⚙️</span> Einstellungen
                    </label>

                    <div className="glider-container">
                        <div className="glider"></div>
                    </div>
                </div>

                <div className="radio-container" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                    <input
                        type="radio"
                        id="nav-beerpong"
                        name="layout-nav"
                        defaultChecked={window.location.hash.includes('beerpong')}
                        onChange={() => window.location.hash = '#/admin/beerpong'}
                    />
                    <label htmlFor="nav-beerpong">
                        <span>🍺</span> Bierpong
                    </label>
                </div>

                <div className="user-profile">
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        👑
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>Admin</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Profi-Host</div>
                    </div>
                    <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}>
                        🚪
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="mobile-toggle" onClick={toggleSidebar}>
                            ☰
                        </button>
                        <h1 className="page-title">{title}</h1>
                    </div>
                    {/* Optional: Add status indicators or clock here */}
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        {new Date().toLocaleDateString()}
                    </div>
                </header>

                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
                />
            )}
        </div>
    );
}
