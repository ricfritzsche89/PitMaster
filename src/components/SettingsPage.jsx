import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        hostName: '',
        paypalLink: '',
        defaultBet: 2,
        lowPerformance: false,
        cameraDeviceId: '',
        masterVolume: 100,
        tickerSpeed: 30, // seconds
        adminPin: ''
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [videoDevices, setVideoDevices] = useState([]);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('pitmaster_settings');
        if (saved) {
            setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
        }

        // Load Video Devices
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            setVideoDevices(videoInputs);
        }).catch(err => console.error("Could not list devices", err));
    }, []);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('pitmaster_settings', JSON.stringify(settings));
        setMsg('✅ Einstellungen gespeichert!');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleExportData = async () => {
        setLoading(true);
        try {
            const eventsSnapshot = await getDocs(collection(db, 'events'));
            const data = {};
            eventsSnapshot.forEach(doc => {
                data[doc.id] = doc.data();
            });

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pitmaster_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            setMsg('✅ Backup heruntergeladen!');
        } catch (err) {
            console.error(err);
            setMsg('❌ Fehler beim Backup exportieren.');
        }
        setLoading(false);
    };

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', color: 'white', paddingBottom: '4rem' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-primary)' }}>
                ⚙️ Einstellungen
            </h1>

            {msg && (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #34d399' }}>
                    {msg}
                </div>
            )}

            <div className="grid gap-6">

                {/* HOST PROFILE */}
                <section className="card p-6">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">👤 Host Profil</h2>
                    <p className="text-slate-400 mb-4 text-sm">Diese Daten werden für neue Events vorausgefüllt.</p>

                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Dein Name (als Host)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={settings.hostName}
                                onChange={(e) => handleChange('hostName', e.target.value)}
                                placeholder="z.B. Ric"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">PayPal.me Link (Standard)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={settings.paypalLink}
                                onChange={(e) => handleChange('paypalLink', e.target.value)}
                                placeholder="paypal.me/deinname"
                            />
                        </div>
                    </div>
                </section>

                {/* HARDWARE */}
                <section className="card p-6">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">📹 Hardware (TV View)</h2>
                    <p className="text-slate-400 mb-4 text-sm">Welche Kamera soll für den Live-Stream auf dem Fernseher genutzt werden?</p>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Kamera Auswahl</label>
                        <select
                            className="input-field"
                            value={settings.cameraDeviceId}
                            onChange={(e) => handleChange('cameraDeviceId', e.target.value)}
                        >
                            <option value="">Standard System-Kamera</option>
                            {videoDevices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Kamera ${device.deviceId.slice(0, 5)}...`}
                                </option>
                            ))}
                        </select>
                        <div className="text-xs text-slate-500 mt-1">Hinweis: Starte die App neu oder lade die Event-Seite neu, damit die Änderung wirksam wird.</div>
                    </div>
                </section>

                {/* AUDIO & EFFECTS */}
                <section className="card p-6">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">🔊 Audio & Effekte</h2>

                    <div className="grid gap-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm text-slate-400">Master Lautstärke (Soundboard)</label>
                                <span className="text-sm font-bold">{settings.masterVolume}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={settings.masterVolume}
                                onChange={(e) => handleChange('masterVolume', parseInt(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm text-slate-400">Ticker Geschwindigkeit (News)</label>
                                <span className="text-sm font-bold">{settings.tickerSpeed}s</span>
                            </div>
                            <input
                                type="range"
                                min="10" max="120" step="5"
                                value={settings.tickerSpeed}
                                onChange={(e) => handleChange('tickerSpeed', parseInt(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                            <div className="text-xs text-slate-500 mt-1">Dauer für einen kompletten Durchlauf einer Nachricht.</div>
                        </div>
                    </div>
                </section>

                {/* GAME DEFAULTS */}
                <section className="card p-6">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">🎲 Spiel-Standards</h2>

                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Standard Wetteinsatz (€)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={settings.defaultBet}
                                onChange={(e) => handleChange('defaultBet', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* SECURITY */}
                <section className="card p-6 border border-slate-600 bg-slate-800/30">
                    <h2 className="text-xl font-bold mb-4 text-red-400">🔐 Sicherheit</h2>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Admin Schutz-PIN</label>
                        <input
                            type="password"
                            className="input-field"
                            value={settings.adminPin}
                            onChange={(e) => handleChange('adminPin', e.target.value)}
                            placeholder="****"
                            maxLength={8}
                        />
                        <div className="text-xs text-slate-500 mt-1">Wird abgefragt, wenn du kritische Aktionen ausführst (z.B. Event löschen). Lass es leer, um keinen Schutz zu haben.</div>
                    </div>
                </section>

                {/* APP SETTINGS */}
                <section className="card p-6">
                    <h2 className="text-xl font-bold mb-4 text-emerald-400">📱 App Performance</h2>

                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="lowPerf"
                            className="w-6 h-6 accent-emerald-500"
                            checked={settings.lowPerformance}
                            onChange={(e) => handleChange('lowPerformance', e.target.checked)}
                        />
                        <label htmlFor="lowPerf" className="cursor-pointer">
                            <div className="font-bold">Performance-Modus</div>
                            <div className="text-sm text-slate-400">Reduziert Animationen (spart Akku am Laptop).</div>
                        </label>
                    </div>
                </section>

                {/* DATA MANAGEMENT */}
                <section className="card p-6 border border-slate-700">
                    <h2 className="text-xl font-bold mb-4 text-slate-200">💾 Daten & Backup</h2>
                    <p className="text-slate-400 mb-4 text-sm">Lade alle deine Events und Ergebnisse als Datei herunter.</p>

                    <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="btn-ghost w-full border-slate-500 hover:bg-slate-800"
                    >
                        {loading ? 'Exportiere...' : '📦 Alles Exportieren (JSON)'}
                    </button>
                </section>

                {/* SAVE BUTTON */}
                <button
                    onClick={handleSave}
                    className="btn-primary w-full py-4 text-xl mt-4 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 transition-all"
                >
                    Einstellungen Speichern
                </button>

            </div>
        </div>
    );
}
