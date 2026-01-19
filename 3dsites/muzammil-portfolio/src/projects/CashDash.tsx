import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CashDash() {
    const [expenses, setExpenses] = useState([
        { id: 1, title: 'Coffee', amount: 5.50 },
        { id: 2, title: 'Subscription', amount: 12.00 }
    ]);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount) return;
        setExpenses([{ id: Date.now(), title, amount: parseFloat(amount) }, ...expenses]);
        setTitle('');
        setAmount('');
    };

    const removeExpense = (id: number) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="min-h-screen bg-accent-cyan p-4 md:p-8 flex justify-center items-center font-sans">
            <Link to="/" className="absolute top-8 left-8 font-mono font-bold text-black border-2 border-transparent hover:border-black px-2 hover:bg-white transition-all">← EXIT_DASH</Link>

            <div className="w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <header className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
                    <h1 className="font-display font-black text-4xl">CASH<span className="text-accent-green">DASH</span></h1>
                    <div className="text-right">
                        <p className="font-mono text-xs text-secondary">TOTAL SPENT</p>
                        <p className="font-black text-3xl">${total.toFixed(2)}</p>
                    </div>
                </header>

                <form onSubmit={addExpense} className="flex gap-2 mb-8">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="WHAT DID YOU BUY?"
                        className="flex-1 border-2 border-black p-3 font-bold focus:bg-accent-yellow focus:outline-none transition-colors"
                    />
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="$"
                        className="w-20 border-2 border-black p-3 font-bold focus:bg-accent-yellow focus:outline-none transition-colors"
                    />
                    <button type="submit" className="bg-black text-white px-6 font-bold hover:bg-accent-red hover:text-black border-2 border-transparent hover:border-black transition-colors">
                        +
                    </button>
                </form>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                    {expenses.map(exp => (
                        <div key={exp.id} className="flex justify-between items-center group hover:bg-gray-50 p-2 border-b border-gray-100">
                            <div className="font-bold">{exp.title}</div>
                            <div className="flex items-center gap-4">
                                <span className="font-mono">${exp.amount.toFixed(2)}</span>
                                <button onClick={() => removeExpense(exp.id)} className="text-red-500 opacity-0 group-hover:opacity-100 font-bold hover:scale-125 transition-all">
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="text-center text-gray-400 font-mono py-8">NO EXPENSES YET. GOOD JOB?</div>
                    )}
                </div>
            </div>
        </div>
    );
}
