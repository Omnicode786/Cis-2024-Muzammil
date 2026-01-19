import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function FocusFlow() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('FOCUS'); // FOCUS, SHORT, LONG

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound ideally
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'FOCUS') setTimeLeft(25 * 60);
        if (mode === 'SHORT') setTimeLeft(5 * 60);
        if (mode === 'LONG') setTimeLeft(15 * 60);
    };

    const setTimerMode = (newMode: string, minutes: number) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(minutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-accent-purple flex flex-col items-center justify-center p-8 transition-colors duration-500">
            <Link to="/" className="absolute top-8 left-8 font-mono font-bold text-white hover:text-accent-yellow">← EXIT</Link>

            <div className="bg-white border-4 border-black shadow-pop p-12 w-full max-w-md text-center transform rotate-1">
                <h1 className="font-display font-black text-6xl mb-2">{formatTime(timeLeft)}</h1>
                <p className="font-mono font-bold text-accent-purple mb-8 text-xl tracking-widest">{mode}_MODE</p>

                <div className="flex gap-4 justify-center mb-8">
                    <button onClick={() => setTimerMode('FOCUS', 25)} className={`font-bold border-2 border-black px-4 py-2 ${mode === 'FOCUS' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>25</button>
                    <button onClick={() => setTimerMode('SHORT', 5)} className={`font-bold border-2 border-black px-4 py-2 ${mode === 'SHORT' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>05</button>
                    <button onClick={() => setTimerMode('LONG', 15)} className={`font-bold border-2 border-black px-4 py-2 ${mode === 'LONG' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>15</button>
                </div>

                <div className="flex gap-4">
                    <button onClick={toggleTimer} className="flex-1 bg-accent-mint border-2 border-black font-black text-2xl py-4 shadow-pop hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        {isActive ? 'PAUSE' : 'START'}
                    </button>
                    <button onClick={resetTimer} className="px-6 border-2 border-black font-bold hover:bg-red-500 hover:text-white transition-colors">
                        R
                    </button>
                </div>
            </div>

            <div className="mt-12 text-center text-white font-mono opacity-50">
                <p>STAY RADICAL. STAY FOCUSED.</p>
            </div>
        </div>
    );
}
