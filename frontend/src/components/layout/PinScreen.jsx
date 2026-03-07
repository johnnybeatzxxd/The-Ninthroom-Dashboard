import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/api';

const PinScreen = ({ onUnlock }) => {
    const [entry, setEntry] = useState('');
    const [correctPin, setCorrectPin] = useState(null);
    const [error, setError] = useState(false);
    const [shaking, setShaking] = useState(false);
    const [hiding, setHiding] = useState(false);
    const entryRef = useRef('');

    useEffect(() => {
        api.global.getPin().then(setCorrectPin).catch(() => setCorrectPin('1234'));
    }, []);

    const clearError = () => setError(false);

    const checkPin = useCallback((pin) => {
        const correct = correctPin || '1234';
        if (pin === correct) {
            setHiding(true);
            setTimeout(() => onUnlock(), 350);
        } else {
            setError(true);
            setShaking(true);
            setTimeout(() => setShaking(false), 400);
            setTimeout(() => {
                setEntry('');
                entryRef.current = '';
                clearError();
            }, 900);
        }
    }, [correctPin, onUnlock]);

    const handleInput = useCallback((digit) => {
        if (entryRef.current.length >= 4) return;
        const next = entryRef.current + digit;
        entryRef.current = next;
        setEntry(next);
        clearError();
        if (next.length === 4) {
            setTimeout(() => checkPin(next), 120);
        }
    }, [checkPin]);

    const handleDelete = useCallback(() => {
        const next = entryRef.current.slice(0, -1);
        entryRef.current = next;
        setEntry(next);
        clearError();
    }, []);

    // Keyboard support
    useEffect(() => {
        const handler = (e) => {
            if (hiding) return;
            if (e.key >= '0' && e.key <= '9') handleInput(e.key);
            if (e.key === 'Backspace') handleDelete();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [hiding, handleInput, handleDelete]);

    if (correctPin === null) return null; // loading

    return (
        <div className={`pin-screen ${hiding ? 'hiding' : ''}`}>
            <div className="pin-card">
                <div className="pin-logo">IX</div>
                <div className="pin-title">The Ninth Room</div>
                <div className="pin-subtitle">Enter PIN to continue</div>

                {/* PIN dots */}
                <div className={`pin-dots ${shaking ? 'shake' : ''}`}>
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`pin-dot ${i < entry.length ? (error ? 'error' : 'filled') : ''}`}
                        />
                    ))}
                </div>

                {/* Numpad */}
                <div className="pin-numpad">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                        <button key={d} className="pin-btn" onClick={() => handleInput(d)}>{d}</button>
                    ))}
                    <div></div>
                    <button className="pin-btn" onClick={() => handleInput('0')}>0</button>
                    <button className="pin-btn pin-del" onClick={handleDelete}>⌫</button>
                </div>

                <div className={`pin-error ${error ? 'visible' : ''}`}>
                    Incorrect PIN — try again
                </div>
            </div>
        </div>
    );
};

export default PinScreen;
