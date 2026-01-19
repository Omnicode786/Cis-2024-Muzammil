import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function TypeFlow() {
    const [size, setSize] = useState(64);
    const [weight, setWeight] = useState(900);
    const [text, setText] = useState("RADICAL");

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col">
            <header className="flex justify-between items-center mb-12 mix-blend-difference">
                <Link to="/" className="font-mono font-bold text-xl hover:text-accent-cyan">← EXIT</Link>
                <h1 className="text-xl font-mono">TYPE_FLOW // TOOL</h1>
            </header>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div
                    className="text-center font-display leading-none whitespace-nowrap"
                    style={{
                        fontSize: `${size}px`,
                        fontWeight: weight,
                        textShadow: `4px 4px 0px #FF3366`
                    }}
                >
                    {text}
                </div>
            </div>

            <div className="border-t border-white/20 pt-8 grid md:grid-cols-3 gap-8 font-mono text-sm">
                <div>
                    <label className="block mb-2 text-white/50">CONTENT</label>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent border border-white/50 p-2 focus:border-accent-cyan outline-none text-white"
                    />
                </div>
                <div>
                    <label className="block mb-2 text-white/50">SIZE ({size}px)</label>
                    <input
                        type="range" min="12" max="300"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full accent-accent-cyan"
                    />
                </div>
                <div>
                    <label className="block mb-2 text-white/50">WEIGHT ({weight})</label>
                    <input
                        type="range" min="100" max="900" step="100"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full accent-accent-cyan"
                    />
                </div>
            </div>
        </div>
    );
}
