import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NeoBoard() {
    // Load from local storage or default
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('neo-board-tasks');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Fix Bugs', status: 'todo' },
            { id: 2, title: 'Ship Feature', status: 'in-progress' },
            { id: 3, title: 'Get Coffee', status: 'done' }
        ];
    });

    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem('neo-board-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (status: string) => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), title: newTask, status }]);
        setNewTask('');
    };

    const moveTask = (id: number, newStatus: string) => {
        setTasks(tasks.map((t: any) => t.id === id ? { ...t, status: newStatus } : t));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter((t: any) => t.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8 font-sans text-black overflow-x-hidden">
            <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <Link to="/" className="font-mono font-bold text-xl hover:text-accent-red self-start md:self-auto">← EXIT</Link>
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-black">NEO_BOARD</h1>
                    <p className="font-mono text-sm opacity-50">PERSISTENT KANBAN SYSTEM</p>
                </div>
                <div className="w-24 hidden md:block"></div>
            </header>

            {/* Input Area */}
            <div className="max-w-md mx-auto mb-12 flex gap-0">
                <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="NEW TASK..."
                    className="flex-1 border-4 border-black p-3 font-bold font-mono focus:outline-none focus:bg-accent-yellow transition-colors"
                />
                <button
                    onClick={() => addTask('todo')}
                    className="bg-black text-white px-6 font-bold border-4 border-black hover:bg-white hover:text-black transition-colors"
                >
                    ADD
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {['todo', 'in-progress', 'done'].map(status => (
                    <div key={status} className={`bg-white border-4 border-black shadow-pop p-6 min-h-[50vh] flex flex-col relative`}>
                        <div className={`absolute top-0 left-0 w-full h-4 ${status === 'todo' ? 'bg-accent-red' : status === 'in-progress' ? 'bg-accent-yellow' : 'bg-accent-mint'} border-b-4 border-black`} />

                        <h2 className="font-display font-black text-2xl uppercase mb-6 mt-4 text-center">{status.replace('-', ' ')}</h2>

                        <div className="space-y-4 flex-1">
                            {tasks.filter((t: any) => t.status === status).map((task: any) => (
                                <div key={task.id} className="bg-white border-2 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-pop transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="leading-tight">{task.title}</p>
                                        <button onClick={() => deleteTask(task.id)} className="text-xs text-gray-400 hover:text-red-500">×</button>
                                    </div>

                                    <div className="flex gap-2 text-[10px] font-mono font-bold">
                                        {status !== 'todo' && (
                                            <button onClick={() => moveTask(task.id, 'todo')} className="bg-gray-100 px-2 py-1 hover:bg-black hover:text-white transition-colors">
                                                ← TODO
                                            </button>
                                        )}
                                        {status !== 'in-progress' && (
                                            <button onClick={() => moveTask(task.id, 'in-progress')} className="bg-gray-100 px-2 py-1 hover:bg-black hover:text-white transition-colors">
                                                {status === 'todo' ? 'START →' : '← BACK'}
                                            </button>
                                        )}
                                        {status !== 'done' && (
                                            <button onClick={() => moveTask(task.id, 'done')} className="bg-accent-mint/20 px-2 py-1 hover:bg-accent-mint hover:text-black transition-colors ml-auto">
                                                DONE →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {tasks.filter((t: any) => t.status === status).length === 0 && (
                                <div className="text-center opacity-20 font-black text-4xl py-12 select-none">
                                    EMPTY
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
