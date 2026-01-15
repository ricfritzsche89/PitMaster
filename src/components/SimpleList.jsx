import React, { useState } from 'react';

export default function SimpleList({ title, items = [], onItemAdd, onItemToggle, onItemDelete, placeholder = "Neuer Eintrag..." }) {
    const [newItem, setNewItem] = useState("");

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        onItemAdd(newItem);
        setNewItem("");
    };

    return (
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{title}</h3>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                {items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => onItemToggle(i)}
                            style={{ cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
                        <button onClick={() => onItemDelete(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '0.8rem' }}>❌</button>
                    </li>
                ))}
                {items.length === 0 && <li style={{ opacity: 0.4, fontSize: '0.9rem' }}>Liste ist leer.</li>}
            </ul>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder={placeholder}
                    className="input-field"
                    style={{ marginBottom: 0, fontSize: '0.9rem', padding: '8px' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '1.2rem' }}>+</button>
            </form>
        </div>
    );
}
