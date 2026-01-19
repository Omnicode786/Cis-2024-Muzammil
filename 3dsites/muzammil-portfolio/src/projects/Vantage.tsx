import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as THREE from 'three';
import { Chart, registerables } from 'chart.js';

// --- Types ---
interface User { id: string; name: string; email: string; avatar?: string; role?: string; bio?: string; }
interface AnalyticsData {
    analytics: {
        revenue: { total: number; growth: number; history: number[] };
        users: { active: number; growth: number; distribution: { mobile: number; desktop: number } };
        regions: { name: string; value: number }[];
    };
    reports: any[];
    customers: any[];
}


type ViewState = 'AUTH' | 'DASHBOARD' | 'ANALYTICS' | 'REPORTS' | 'CUSTOMERS' | 'SETTINGS' | 'PROFILE' | 'IMMERSIVE';
type Theme = 'light' | 'dark';

// Register Chart.js components
Chart.register(...registerables);

// --- Chart Generation Utilities ---

const getLastNMonths = (n: number): string[] => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const result: string[] = [];
    const currentDate = new Date();

    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        result.push(months[d.getMonth()]);
    }

    return result;
};

const generateChartImage = async (config: any): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px'; // Position off-screen
        canvas.style.top = '-9999px';

        // Append to body - Chart.js needs the canvas in the DOM to render properly
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Failed to get canvas context');
            document.body.removeChild(canvas);
            resolve('');
            return;
        }

        try {
            const chart = new Chart(ctx, config);

            // Wait for chart to render completely
            setTimeout(() => {
                try {
                    const imageData = canvas.toDataURL('image/png');
                    chart.destroy();
                    document.body.removeChild(canvas); // Clean up

                    // Validate that we got actual image data
                    if (imageData && imageData.startsWith('data:image/png;base64,') && imageData.length > 100) {
                        resolve(imageData);
                    } else {
                        console.error('Invalid image data generated, length:', imageData.length);
                        resolve('');
                    }
                } catch (error) {
                    console.error('Error converting chart to image:', error);
                    try {
                        chart.destroy();
                        if (document.body.contains(canvas)) {
                            document.body.removeChild(canvas);
                        }
                    } catch (cleanupError) {
                        // Ignore cleanup errors
                    }
                    resolve('');
                }
            }, 1000); // Increased to 1000ms for reliable rendering
        } catch (error) {
            console.error('Error creating chart:', error);
            if (document.body.contains(canvas)) {
                document.body.removeChild(canvas);
            }
            resolve('');
        }
    });
};

const createRevenueChart = async (history: number[]): Promise<string> => {
    const labels = getLastNMonths(history.length || 7);

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue ($k)',
                data: history,
                borderColor: '#7C3AED',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#7C3AED',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: `Revenue Trend (${history.length} Months)`, font: { size: 16, weight: 'bold' } }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Revenue ($k)' } },
                x: { title: { display: true, text: 'Month' } }
            }
        }
    };
    return generateChartImage(config);
};

const createRegionalChart = async (regions: any[]): Promise<string> => {
    const config = {
        type: 'pie',
        data: {
            labels: regions.map(r => r.name),
            datasets: [{
                data: regions.map(r => r.value),
                backgroundColor: ['#7C3AED', '#3B82F6', '#10B981'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: { display: true, position: 'right' },
                title: { display: true, text: 'Regional Distribution', font: { size: 16, weight: 'bold' } }
            }
        }
    };
    return generateChartImage(config);
};

const createDeviceChart = async (distribution: { mobile: number; desktop: number }): Promise<string> => {
    const config = {
        type: 'bar',
        data: {
            labels: ['Mobile', 'Desktop'],
            datasets: [{
                label: 'Usage (%)',
                data: [distribution.mobile, distribution.desktop],
                backgroundColor: ['#3B82F6', '#7C3AED'],
                borderColor: ['#2563EB', '#6D28D9'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            animation: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Device Distribution', font: { size: 16, weight: 'bold' } }
            },
            scales: {
                y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage (%)' } }
            }
        }
    };
    return generateChartImage(config);
};


// --- Sub-Components ---

const AuthView = ({
    isLogin, setIsLogin, email, setEmail, password, setPassword, handleLogin, loading, authError
}: any) => (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
        <div className="hidden md:flex w-1/2 bg-accent-purple items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20" />
            <div className="relative z-10 text-center">
                <h1 className="text-6xl font-black font-display mb-4 tracking-tighter">VANTAGE</h1>
                <p className="font-mono text-xl opacity-80 tracking-widest">ENTERPRISE INTELLIGENCE</p>
            </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-900 border-l border-gray-800">
            <div className="w-full max-w-md">
                <h2 className="text-4xl font-black mb-2 text-white">{isLogin ? 'Welcome Back' : 'Join Vantage'}</h2>
                <form onSubmit={handleLogin} className="space-y-6 mt-10">
                    <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-800 border-gray-700 p-4 rounded-lg text-white" placeholder="admin@vantage.com" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-800 border-gray-700 p-4 rounded-lg text-white" placeholder="••••••••" />
                    {authError && <div className="text-red-400 text-sm font-bold">⚠ {authError}</div>}
                    <button disabled={loading} className="w-full bg-accent-purple h-14 rounded-lg font-bold">{loading ? '...' : (isLogin ? 'ACCESS' : 'JOIN')}</button>
                </form>
                <div className="mt-8 text-center text-sm text-gray-400">
                    <button onClick={() => setIsLogin(!isLogin)} className="hover:text-white">{isLogin ? 'Create Account' : 'Back to Login'}</button>
                    <span className="mx-4">|</span>
                    <Link to="/" className="hover:text-white">Home</Link>
                </div>
            </div>
        </div>
    </div>
);

const Sidebar = ({ view, setView, user }: any) => {
    const navItems = [
        { id: 'DASHBOARD', label: 'Overview', icon: '📊' },
        { id: 'ANALYTICS', label: 'Analytics', icon: '📈' },
        { id: 'REPORTS', label: 'Reports', icon: '📑' },
        { id: 'CUSTOMERS', label: 'Customers', icon: '👥' },
        { id: 'IMMERSIVE', label: 'Immersive 3D', icon: '🧊' }
    ];

    return (
        <aside className="w-20 md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between z-20 shadow-xl">
            <div>
                <div className="h-20 flex items-center justify-center md:justify-start md:px-8 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 bg-accent-purple rounded-lg md:mr-3" />
                    <span className="font-bold text-xl hidden md:block dark:text-white">VANTAGE</span>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => setView(item.id)} className={`flex items-center w-full p-3 rounded-xl transition-all ${view === item.id ? 'bg-purple-50 dark:bg-purple-900/20 text-accent-purple font-bold' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400'}`}>
                            <span className="text-xl mr-3">{item.icon}</span>
                            <span className="hidden md:block text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <div className="p-4 border-t dark:border-gray-800 space-y-2">
                <button onClick={() => setView('PROFILE')} className={`flex items-center p-3 w-full rounded-xl ${view === 'PROFILE' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-accent-purple text-white flex items-center justify-center text-xs font-bold mr-3">{user?.name?.[0]}</div>
                    <div className="hidden md:block text-left overflow-hidden">
                        <div className="text-xs font-bold truncate dark:text-white">{user?.name}</div>
                        <div className="text-[10px] text-gray-400">View Profile</div>
                    </div>
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setView('SETTINGS')} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">⚙</button>
                    <button onClick={() => setView('AUTH')} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">🚪</button>
                </div>
            </div>
        </aside>
    );
};

const Topbar = ({ toggleTheme, theme, title }: any) => (
    <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center px-8">
        <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
        <button onClick={toggleTheme} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === 'dark' ? '☀' : '🌙'}
        </button>
    </header>
);

const AIWidget = ({ apiKey, setApiKey, data }: { apiKey: string; setApiKey: (key: string) => void; data: any }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [autoInsight, setAutoInsight] = useState('');
    const [prediction, setPrediction] = useState('');
    const [anomalies, setAnomalies] = useState<string[]>([]);

    // Auto-generate insight on mount with caching
    useEffect(() => {
        if (apiKey && data?.analytics) {
            // Create a fingerprint of the data to detect changes
            const dataFingerprint = `${data.analytics.revenue.total}-${data.analytics.revenue.growth}-${data.analytics.users.active}-${data.analytics.users.growth}`;
            const cachedInsight = localStorage.getItem(`vantage_insight_${dataFingerprint}`);
            const cachedAnomalies = localStorage.getItem(`vantage_anomalies_${dataFingerprint}`);

            // Use cached insight if available
            if (cachedInsight) {
                setAutoInsight(cachedInsight);
            } else if (!loading) {
                // Only fetch if not already loading and no cache
                const autoPrompt = `Based on revenue of $${data.analytics.revenue.total} with ${data.analytics.revenue.growth}% growth and ${data.analytics.users.active} active users with ${data.analytics.users.growth}% growth, provide ONE brief business recommendation (max 20 words).`;

                fetch('http://localhost:3001/api/ai/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey, prompt: autoPrompt })
                })
                    .then(res => res.json())
                    .then(result => {
                        const insight = result.result || '';
                        setAutoInsight(insight);
                        // Cache the result
                        if (insight) localStorage.setItem(`vantage_insight_${dataFingerprint}`, insight);
                    })
                    .catch(() => { });
            }

            // Use cached anomalies if available
            if (cachedAnomalies) {
                try {
                    setAnomalies(JSON.parse(cachedAnomalies));
                } catch (e) {
                    // Invalid cache, detect anomalies
                    detectAnomalies(dataFingerprint);
                }
            } else {
                detectAnomalies(dataFingerprint);
            }
        }
    }, [apiKey, data]);

    const askAI = async () => {
        if (!apiKey || !prompt) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, prompt })
            });
            const data = await res.json();
            if (data.error) {
                setResponse(`Error: ${data.error}. Please check your API key in Settings.`);
            } else {
                setResponse(data.result || 'No response generated.');
            }
        } catch {
            setResponse('Connection Error. Ensure server is running on port 3001.');
        } finally {
            setLoading(false);
        }
    };

    const generatePrediction = async () => {
        if (!apiKey) return;
        setLoading(true);
        try {
            const history = data?.analytics?.revenue?.history || [];
            const predictPrompt = `Revenue trend over 7 months: ${history.join(', ')}k. Predict next month's revenue in one short sentence (max 15 words).`;
            const res = await fetch('http://localhost:3001/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, prompt: predictPrompt })
            });
            const aiData = await res.json();
            setPrediction(aiData.result || 'Unable to generate prediction.');
        } catch {
            setPrediction('Prediction failed.');
        } finally {
            setLoading(false);
        }
    };

    const detectAnomalies = async (dataFingerprint?: string) => {
        if (!apiKey || !data?.analytics) return;

        const fingerprint = dataFingerprint || `${data.analytics.revenue.total}-${data.analytics.revenue.growth}-${data.analytics.users.active}-${data.analytics.users.growth}`;

        try {
            const anomalyPrompt = `Analyze this data for anomalies: Revenue growth: ${data.analytics.revenue.growth}%, User growth: ${data.analytics.users.growth}%, Mobile usage: ${data.analytics.users.distribution.mobile}%. List any concerning patterns in one brief sentence (max 20 words). If none, say "No anomalies detected."`;
            const res = await fetch('http://localhost:3001/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, prompt: anomalyPrompt })
            });
            const aiData = await res.json();
            if (aiData.result && !aiData.result.toLowerCase().includes('no anomalies')) {
                const anomalyList = [aiData.result];
                setAnomalies(anomalyList);
                // Cache the result
                localStorage.setItem(`vantage_anomalies_${fingerprint}`, JSON.stringify(anomalyList));
            } else {
                setAnomalies([]);
                localStorage.setItem(`vantage_anomalies_${fingerprint}`, JSON.stringify([]));
            }
        } catch {
            // Silently fail anomaly detection
        }
    };

    if (!apiKey) return <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-600 dark:text-blue-400">ℹ Set OpenAI Key in Settings to enable AI Analyst.</div>;

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    🤖 AI Business Analyst
                    {autoInsight && <span className="text-xs bg-green-500 px-2 py-0.5 rounded">AUTO</span>}
                </h3>

                {/* Anomaly Alerts */}
                {anomalies.length > 0 && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-sm">
                        <div className="font-bold mb-1">⚠️ Anomaly Detected:</div>
                        {anomalies.map((anomaly, idx) => <div key={idx}>{anomaly}</div>)}
                    </div>
                )}

                {autoInsight && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded text-sm">
                        <div className="font-bold mb-1">💡 Today's Insight:</div>
                        {autoInsight}
                    </div>
                )}

                {prediction && (
                    <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded text-sm">
                        <div className="font-bold mb-1">🔮 Prediction:</div>
                        {prediction}
                    </div>
                )}

                <div className="h-32 overflow-y-auto bg-black/20 p-3 rounded mb-4 text-sm font-mono whitespace-pre-wrap">
                    {response || "Ask me anything about your data or try 'Predict Revenue' below..."}
                </div>

                <div className="flex gap-2 mb-3">
                    <input
                        value={prompt} onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && askAI()}
                        className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm outline-none focus:border-white"
                        placeholder="e.g., Analyze revenue trends or What's driving user growth?"
                    />
                    <button onClick={askAI} disabled={loading} className="bg-white text-purple-900 font-bold px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50">
                        {loading ? '...' : 'Ask'}
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={generatePrediction}
                        disabled={loading}
                        className="flex-1 bg-blue-500 text-white font-bold px-3 py-2 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                    >
                        🔮 Predict Revenue
                    </button>
                    <button
                        onClick={() => detectAnomalies()}
                        disabled={loading}
                        className="flex-1 bg-yellow-500 text-white font-bold px-3 py-2 rounded text-xs hover:bg-yellow-600 disabled:opacity-50"
                    >
                        ⚠️ Detect Anomalies
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardContent = ({ data, apiKey, setApiKey }: any) => (
    <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 card-hover group">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2">Total Revenue</div>
                <div className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-accent-purple transition-colors">${data?.analytics?.revenue?.total.toLocaleString()}</div>
                <div className="text-green-500 text-sm font-bold mt-1 bg-green-100 dark:bg-green-900/30 w-fit px-2 py-0.5 rounded-full">+{data?.analytics?.revenue?.growth}%</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 card-hover group">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-2">Active Users</div>
                <div className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{data?.analytics?.users?.active.toLocaleString()}</div>
                <div className="text-blue-500 text-sm font-bold mt-1 bg-blue-100 dark:bg-blue-900/30 w-fit px-2 py-0.5 rounded-full">+{data?.analytics?.users?.growth}%</div>
            </div>
            <div className="md:col-span-2">
                <AIWidget apiKey={apiKey} setApiKey={setApiKey} data={data} />
            </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex flex-col h-96">
                <h3 className="font-bold mb-6 text-gray-900 dark:text-white">Revenue Trend (7 Months)</h3>
                <div className="flex-1 flex items-end justify-between gap-2 px-4 border-b border-l border-gray-200 dark:border-gray-700 relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                        {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-black dark:border-white" />)}
                    </div>
                    {data?.analytics?.revenue?.history.map((h: number, i: number) => (
                        <div key={i} className="w-full bg-gradient-to-t from-accent-purple to-purple-400 rounded-t-md relative group cursor-pointer hover:opacity-80 transition-all shadow-lg shadow-purple-900/20" style={{ height: `${Math.max(5, (h / Math.max(...(data?.analytics?.revenue?.history || [1]))) * 100)}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                ${h}k
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {getLastNMonths(7).map((m: string) => <span key={m}>{m}</span>)}
                </div>
            </div>

            {/* Regional Distribution */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 flex flex-col">
                <h3 className="font-bold mb-6 text-gray-900 dark:text-white">Regional Distribution</h3>
                <div className="flex-1 flex items-center justify-center relative">
                    <svg viewBox="0 0 100 100" className="w-full max-w-[220px]">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#374151" strokeWidth="15" className="opacity-10 dark:opacity-50" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#7C3AED" strokeWidth="15" strokeDasharray={`${(data?.analytics?.regions[0]?.value || 0) * 2.51} 251`} strokeDashoffset="0" className="drop-shadow-lg transition-all" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="15" strokeDasharray={`${(data?.analytics?.regions[1]?.value || 0) * 2.51} 251`} strokeDashoffset={`-${(data?.analytics?.regions[0]?.value || 0) * 2.51}`} className="drop-shadow-lg transition-all" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="15" strokeDasharray={`${(data?.analytics?.regions[2]?.value || 0) * 2.51} 251`} strokeDashoffset={`-${((data?.analytics?.regions[0]?.value || 0) + (data?.analytics?.regions[1]?.value || 0)) * 2.51}`} className="drop-shadow-lg transition-all" />
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-3xl font-black text-gray-900 dark:text-white">Global</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Coverage</div>
                    </div>
                </div>
                <div className="mt-6 space-y-3">
                    {data?.analytics?.regions.map((r: any, idx: number) => (
                        <div key={r.name} className="flex justify-between text-sm items-center">
                            <span className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-accent-purple' : idx === 1 ? 'bg-blue-500' : 'bg-green-500'}`} />
                                {r.name}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white font-mono">{r.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const AnalyticsContent = ({ data, apiKey }: any) => {
    const [aiInsights, setAiInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);

    useEffect(() => {
        if (apiKey && data?.analytics) {
            // Check cache first
            const dataFingerprint = `${data.analytics.users.distribution.mobile}-${data.analytics.users.distribution.desktop}`;
            const cachedInsights = localStorage.getItem(`vantage_analytics_insights_${dataFingerprint}`);

            if (cachedInsights) {
                setAiInsights(cachedInsights);
            } else {
                generateInsights();
            }
        }
    }, [apiKey, data]);

    const generateInsights = async () => {
        if (!apiKey || !data?.analytics) return;
        setLoadingInsights(true);

        const dataFingerprint = `${data.analytics.users.distribution.mobile}-${data.analytics.users.distribution.desktop}`;

        try {
            const insightPrompt = `Analyze: Mobile ${data?.analytics?.users?.distribution?.mobile}%, Desktop ${data?.analytics?.users?.distribution?.desktop}%, Conversion 12.4%, Retention 87.2%. Provide 2 key insights (max 30 words total).`;
            const res = await fetch('http://localhost:3001/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey, prompt: insightPrompt })
            });
            const aiData = await res.json();
            if (aiData.result) {
                setAiInsights(aiData.result);
                // Cache the insights
                localStorage.setItem(`vantage_analytics_insights_${dataFingerprint}`, aiData.result);
            }
        } catch {
            // Silently fail
        } finally {
            setLoadingInsights(false);
        }
    };

    return (
        <div className="p-8 space-y-6">
            {/* AI Insights Panel */}
            {apiKey && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl text-white shadow-lg">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                        🧠 AI Analytics Insights
                        {loadingInsights && <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Loading...</span>}
                    </h3>
                    <p className="text-sm opacity-90">
                        {aiInsights || 'Generating insights based on your analytics data...'}
                    </p>
                    <button
                        onClick={generateInsights}
                        disabled={loadingInsights}
                        className="mt-4 bg-white text-purple-600 font-bold px-4 py-2 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    >
                        🔄 Refresh Insights
                    </button>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* User Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="font-bold mb-6 text-gray-900 dark:text-white">Device Distribution</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Mobile</span>
                                <span className="font-bold dark:text-white">{data?.analytics?.users?.distribution?.mobile}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" style={{ width: `${data?.analytics?.users?.distribution?.mobile}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Desktop</span>
                                <span className="font-bold dark:text-white">{data?.analytics?.users?.distribution?.desktop}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all" style={{ width: `${data?.analytics?.users?.distribution?.desktop}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="font-bold mb-6 text-gray-900 dark:text-white">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Conversion</div>
                            <div className="text-2xl font-black dark:text-white">12.4%</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Retention</div>
                            <div className="text-2xl font-black dark:text-white">87.2%</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Churn</div>
                            <div className="text-2xl font-black dark:text-white">2.1%</div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Avg LTV</div>
                            <div className="text-2xl font-black dark:text-white">$4.2k</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportsContent = ({ reports, generateReport, data, apiKey }: any) => {
    const handleDownload = async (report: any) => {
        const doc = new jsPDF();
        let yPos = 0;

        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:10px;z-index:9999;';
        loadingDiv.textContent = 'Generating PDF with charts and AI insights...';
        document.body.appendChild(loadingDiv);

        try {
            // Generate charts with validation
            console.log('Generating charts...');
            const revenueChart = await createRevenueChart(data?.analytics?.revenue?.history || []);
            const regionalChart = await createRegionalChart(data?.analytics?.regions || []);
            const deviceChart = await createDeviceChart(data?.analytics?.users?.distribution || { mobile: 0, desktop: 0 });

            console.log('Charts generated:', {
                revenue: revenueChart ? 'success' : 'failed',
                regional: regionalChart ? 'success' : 'failed',
                device: deviceChart ? 'success' : 'failed'
            });

            // Generate AI Executive Summary
            let executiveSummary = 'Business performance shows steady growth across key metrics.';
            if (apiKey) {
                try {
                    const summaryPrompt = `Generate a brief 2-sentence executive summary for a business report with: Revenue: $${data?.analytics?.revenue?.total}, Growth: ${data?.analytics?.revenue?.growth}%, Active Users: ${data?.analytics?.users?.active}. Be professional and concise.`;
                    const res = await fetch('http://localhost:3001/api/ai/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ apiKey, prompt: summaryPrompt })
                    });
                    const aiData = await res.json();
                    if (aiData.result) executiveSummary = aiData.result;
                } catch (e) {
                    console.error('AI summary failed:', e);
                }
            }

            // Header
            doc.setFillColor(124, 58, 237);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('VANTAGE ANALYTICS', 20, 25);
            doc.setFontSize(12);
            doc.text('Enterprise Business Intelligence Report', 20, 33);

            yPos = 50;

            // Report Info
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text(report.name, 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.text(`Generated: ${report.date} | Type: ${report.type} | Status: ${report.status}`, 20, yPos);
            yPos += 15;

            // Executive Summary (AI-Generated)
            doc.setFontSize(14);
            doc.setTextColor(124, 58, 237);
            doc.text('EXECUTIVE SUMMARY', 20, yPos);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 10;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            const summaryLines = doc.splitTextToSize(executiveSummary, 170);
            doc.text(summaryLines, 20, yPos);
            yPos += summaryLines.length * 5 + 10;

            // Financial Summary
            doc.setFontSize(14);
            doc.setTextColor(124, 58, 237);
            doc.text('FINANCIAL SUMMARY', 20, yPos);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 10;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.text(`Total Revenue: $${(data?.analytics?.revenue?.total || 0).toLocaleString()}`, 25, yPos);
            yPos += 8;
            doc.text(`Growth Rate: +${data?.analytics?.revenue?.growth || 0}%`, 25, yPos);
            yPos += 8;
            doc.text(`Active Users: ${(data?.analytics?.users?.active || 0).toLocaleString()}`, 25, yPos);
            yPos += 8;
            doc.text(`User Growth: +${data?.analytics?.users?.growth || 0}%`, 25, yPos);
            yPos += 15;

            // Revenue Trend Chart
            if (revenueChart && revenueChart.startsWith('data:image/png;base64,') && yPos < 250) {
                doc.setFontSize(12);
                doc.setTextColor(124, 58, 237);
                doc.text('REVENUE TREND ANALYSIS', 20, yPos);
                yPos += 5;
                try {
                    doc.addImage(revenueChart, 'PNG', 20, yPos, 170, 85);
                    yPos += 90;
                } catch (imgError) {
                    console.error('Failed to embed revenue chart:', imgError);
                    yPos += 10; // Skip the chart space
                }
            }

            // Add new page if needed
            if (yPos > 220) {
                doc.addPage();
                yPos = 20;
            }

            // Regional Breakdown
            doc.setFontSize(14);
            doc.setTextColor(124, 58, 237);
            doc.text('REGIONAL BREAKDOWN', 20, yPos);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 10;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            data?.analytics?.regions.forEach((r: any) => {
                doc.text(`${r.name}: ${r.value}%`, 25, yPos);
                yPos += 8;
            });
            yPos += 10;

            // Regional Chart
            if (regionalChart && regionalChart.startsWith('data:image/png;base64,') && yPos < 230) {
                try {
                    doc.addImage(regionalChart, 'PNG', 20, yPos, 170, 85);
                    yPos += 90;
                } catch (imgError) {
                    console.error('Failed to embed regional chart:', imgError);
                    yPos += 10;
                }
            }

            // Add new page for device distribution
            if (yPos > 220) {
                doc.addPage();
                yPos = 20;
            }

            // Device Distribution
            doc.setFontSize(14);
            doc.setTextColor(124, 58, 237);
            doc.text('DEVICE DISTRIBUTION', 20, yPos);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 10;

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.text(`Mobile: ${data?.analytics?.users?.distribution?.mobile || 0}%`, 25, yPos);
            yPos += 8;
            doc.text(`Desktop: ${data?.analytics?.users?.distribution?.desktop || 0}%`, 25, yPos);
            yPos += 10;

            // Device Chart
            if (deviceChart && deviceChart.startsWith('data:image/png;base64,') && yPos < 230) {
                try {
                    doc.addImage(deviceChart, 'PNG', 20, yPos, 170, 85);
                    yPos += 90;
                } catch (imgError) {
                    console.error('Failed to embed device chart:', imgError);
                    yPos += 10;
                }
            }

            // Add new page for key metrics
            if (yPos > 220) {
                doc.addPage();
                yPos = 20;
            }

            // Key Metrics Table
            doc.setFontSize(14);
            doc.setTextColor(124, 58, 237);
            doc.text('KEY PERFORMANCE INDICATORS', 20, yPos);
            doc.line(20, yPos + 2, 190, yPos + 2);
            yPos += 10;

            // Table headers
            doc.setFillColor(240, 240, 240);
            doc.rect(20, yPos, 85, 8, 'F');
            doc.rect(105, yPos, 85, 8, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.text('Metric', 22, yPos + 5);
            doc.text('Value', 107, yPos + 5);
            yPos += 10;

            // Table rows
            const metrics = [
                ['Conversion Rate', '12.4%'],
                ['Customer Retention', '87.2%'],
                ['Churn Rate', '2.1%'],
                ['Average LTV', '$4,200']
            ];

            metrics.forEach((metric, idx) => {
                if (idx % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(20, yPos - 2, 85, 7, 'F');
                    doc.rect(105, yPos - 2, 85, 7, 'F');
                }
                doc.text(metric[0], 22, yPos + 3);
                doc.text(metric[1], 107, yPos + 3);
                yPos += 7;
            });

            yPos += 10;

            // AI Recommendations
            if (apiKey && yPos < 250) {
                doc.setFontSize(14);
                doc.setTextColor(124, 58, 237);
                doc.text('AI-POWERED RECOMMENDATIONS', 20, yPos);
                doc.line(20, yPos + 2, 190, yPos + 2);
                yPos += 10;

                try {
                    const recPrompt = `Based on ${data?.analytics?.revenue?.growth}% revenue growth and ${data?.analytics?.users?.growth}% user growth, provide 3 brief business recommendations (max 15 words each). Format as numbered list.`;
                    const res = await fetch('http://localhost:3001/api/ai/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ apiKey, prompt: recPrompt })
                    });
                    const aiData = await res.json();
                    if (aiData.result) {
                        doc.setTextColor(0, 0, 0);
                        doc.setFontSize(10);
                        const recLines = doc.splitTextToSize(aiData.result, 170);
                        doc.text(recLines, 25, yPos);
                    }
                } catch (e) {
                    console.error('AI recommendations failed:', e);
                }
            }

            // Footer on all pages
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text('Generated by Vantage Analytics Enterprise System', 20, 280);
                doc.text('Confidential - For Internal Use Only', 20, 285);
                doc.text(`Page ${i} of ${pageCount}`, 180, 285);
            }

            doc.save(report.name);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            document.body.removeChild(loadingDiv);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Reports</h2>
                <button onClick={generateReport} className="bg-accent-purple text-white font-bold px-6 py-3 rounded-lg hover:bg-purple-700 transition">+ Generate PDF Report</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border dark:border-gray-700">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-mono">
                        <tr><th className="p-4">NAME</th><th className="p-4">DATE</th><th className="p-4">TYPE</th><th className="p-4">ACTION</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 dark:text-gray-300">
                        {reports?.map((r: any) => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                                <td className="p-4 font-bold">{r.name}</td>
                                <td className="p-4">{r.date}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">{r.type}</span></td>
                                <td className="p-4"><button onClick={() => handleDownload(r)} className="text-accent-purple font-bold hover:underline">Download PDF</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CustomersContent = ({ customers, addCustomer, editCustomer, deleteCustomer }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [ltv, setLtv] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            editCustomer(editingId, name, email, ltv).then(() => {
                setName(''); setEmail(''); setLtv(''); setEditingId(null);
            });
        } else {
            addCustomer(name, email, ltv).then(() => {
                setName(''); setEmail(''); setLtv('');
            });
        }
    };

    const startEdit = (customer: any) => {
        setEditingId(customer.id);
        setName(customer.name);
        setEmail(customer.email);
        setLtv(customer.ltv.toString());
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold dark:text-white mb-6">Enterprise Clients</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 mb-8">
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Client Name" className="flex-1 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 p-3 rounded-lg dark:text-white" required />
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="flex-1 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 p-3 rounded-lg dark:text-white" required />
                    <input value={ltv} onChange={e => setLtv(e.target.value)} placeholder="LTV ($)" type="number" className="w-32 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 p-3 rounded-lg dark:text-white" required />
                    <button className="bg-gray-900 dark:bg-white text-white dark:text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition">
                        {editingId ? 'Update' : 'Add'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => { setEditingId(null); setName(''); setEmail(''); setLtv(''); }} className="bg-red-500 text-white font-bold px-4 py-3 rounded-lg hover:bg-red-600 transition">
                            Cancel
                        </button>
                    )}
                </form>
            </div>
            <div className="grid gap-4">
                {customers?.map((c: any) => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 flex justify-between items-center hover:border-purple-300 dark:hover:border-purple-700 transition">
                        <div className="font-bold dark:text-white">{c.name} <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{c.email}</span></div>
                        <div className="flex items-center gap-4">
                            <div className="font-mono font-bold text-green-500">${c.ltv?.toLocaleString()}</div>
                            <button onClick={() => startEdit(c)} className="text-blue-500 hover:underline font-bold text-sm">Edit</button>
                            <button onClick={() => deleteCustomer(c.id)} className="text-red-500 hover:underline font-bold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfileView = ({ user, setUser }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name, bio: user?.bio, role: user?.role });

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, ...formData })
            });
            if (!res.ok) throw new Error('Failed to save');
            const updatedUser = await res.json();
            setUser(updatedUser);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to save profile. Please try again.');
        }
    };

    return (
        <div className="p-8 flex justify-center">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-lg border dark:border-gray-700 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-accent-purple to-indigo-600 relative">
                    <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1 flex items-center justify-center text-4xl shadow-xl">🦁</div>
                </div>
                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-black dark:text-white">{user?.name}</h2>
                        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition">
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                            {isEditing ? (
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-100 dark:bg-gray-900 p-2 rounded border dark:border-gray-700 dark:text-white" />
                            ) : <div className="dark:text-white">{user?.name}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
                            {isEditing ? (
                                <input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-gray-100 dark:bg-gray-900 p-2 rounded border dark:border-gray-700 dark:text-white" />
                            ) : <div className="dark:text-white">{user?.role}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                            {isEditing ? (
                                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full bg-gray-100 dark:bg-gray-900 p-2 rounded border dark:border-gray-700 dark:text-white h-24" />
                            ) : <div className="dark:text-white">{user?.bio}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImmersiveView = ({ data }: any) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current || !data) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Neon Grid Floor
        const gridHelper = new THREE.GridHelper(40, 40, 0x7c3aed, 0x3730a3);
        scene.add(gridHelper);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x7c3aed, 2, 50);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 50);
        pointLight2.position.set(-10, 10, -10);
        scene.add(pointLight2);

        // Data City - Revenue History as Neon Skyscrapers
        const history = data.analytics.revenue.history || [];
        const bars: { mesh: THREE.Mesh; baseY: number }[] = [];

        history.forEach((val: number, i: number) => {
            const height = Math.max(0.5, val * 0.15);
            const geometry = new THREE.BoxGeometry(1.5, height, 1.5);
            const material = new THREE.MeshStandardMaterial({
                color: 0x7c3aed,
                emissive: 0x7c3aed,
                emissiveIntensity: 0.5,
                roughness: 0.2,
                metalness: 0.8
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = (i - history.length / 2) * 3;
            cube.position.y = height / 2;
            scene.add(cube);
            bars.push({ mesh: cube, baseY: height / 2 });

            // Neon edge glow
            const edges = new THREE.EdgesGeometry(geometry);
            const edgeMat = new THREE.LineBasicMaterial({ color: 0xa78bfa });
            const wireframe = new THREE.LineSegments(edges, edgeMat);
            cube.add(wireframe);
        });

        camera.position.set(0, 8, 20);
        camera.lookAt(0, 0, 0);

        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.005;

            bars.forEach((bar, i) => {
                bar.mesh.rotation.y = Math.sin(time + i * 0.2) * 0.1;
                bar.mesh.position.y = bar.baseY + Math.sin(time * 2 + i) * 0.1;
            });

            camera.position.x = Math.sin(time * 0.2) * 15;
            camera.position.z = Math.cos(time * 0.2) * 15;
            camera.lookAt(0, 3, 0);

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        };
    }, [data]);

    return (
        <div className="w-full h-full relative bg-black">
            <div className="absolute top-4 left-4 z-10 text-white bg-black/70 backdrop-blur p-4 rounded-lg border border-purple-500/30">
                <h2 className="font-bold text-xl">CYBERPUNK DATA CITY</h2>
                <p className="text-sm opacity-70">Revenue visualized as neon skyscrapers</p>
            </div>
            <div ref={mountRef} className="w-full h-full" />
        </div>
    );
};

const SettingsView = ({ theme, toggleTheme, apiKey, setApiKey }: any) => (
    <div className="p-8 flex justify-center h-full items-center">
        <div className="bg-white dark:bg-gray-800 max-w-lg w-full p-8 rounded-2xl shadow-xl border dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-8 dark:text-white">Settings</h2>
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-6 border-b dark:border-gray-700">
                    <div>
                        <h3 className="font-bold dark:text-white">Appearance</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">System theme ({theme})</p>
                    </div>
                    <button onClick={toggleTheme} className={`w-14 h-8 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-accent-purple' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
                <div>
                    <h3 className="font-bold dark:text-white mb-2">OpenAI API Key</h3>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => {
                            setApiKey(e.target.value);
                            localStorage.setItem('vantage_openai_key', e.target.value);
                        }}
                        className="w-full bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 p-3 rounded text-sm dark:text-white"
                        placeholder="sk-..."
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Required for AI Analyst features. Saved locally.</p>
                </div>
            </div>
        </div>
    </div>
);

export default function Vantage() {
    const [view, setView] = useState<ViewState>('AUTH');
    const [theme, setTheme] = useState<Theme>('dark');
    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');

    // Auth State
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Load API Key from localStorage
    useEffect(() => {
        const savedKey = localStorage.getItem('vantage_openai_key');
        if (savedKey) setApiKey(savedKey);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        try {
            const endpoint = isLogin ? '/api/login' : '/api/signup';
            const body = isLogin ? { email, password } : { email, password, name: 'New User' };
            const res = await fetch(`http://localhost:3001${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Auth Failed');
            const resData = await res.json();
            setUser(resData.user);
            setData(resData.data);
            setView('DASHBOARD');
        } catch (err: any) {
            setAuthError('Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        if (!user) return;
        const res = await fetch('http://localhost:3001/api/reports/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, type: 'FINANCIAL' }) });
        const newReport = await res.json();
        setData(prev => prev ? { ...prev, reports: [newReport, ...prev.reports] } : null);
    };

    const addCustomer = async (name: string, email: string, ltv: string) => {
        if (!user) return;
        const res = await fetch('http://localhost:3001/api/customers/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, name, email, ltv }) });
        const newCustomer = await res.json();
        const ltvVal = Number(ltv) || 0;
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                customers: [newCustomer, ...prev.customers],
                analytics: {
                    ...prev.analytics,
                    revenue: {
                        ...prev.analytics.revenue,
                        total: prev.analytics.revenue.total + ltvVal,
                        history: [...prev.analytics.revenue.history.slice(1), Math.floor((prev.analytics.revenue.total + ltvVal) / 1000)]
                    }
                }
            };
        });
    };

    const editCustomer = async (id: string, name: string, email: string, ltv: string) => {
        if (!user) return;
        // For now just refetch - in production would have PUT endpoint
        await addCustomer(name, email, ltv);
    };

    const deleteCustomer = async (id: string) => {
        if (!user) return;
        // For now just update local state - in production would have DELETE endpoint
        setData(prev => prev ? { ...prev, customers: prev.customers.filter((c: any) => c.id !== id) } : null);
    };

    if (view === 'AUTH') return <AuthView isLogin={isLogin} setIsLogin={setIsLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} handleLogin={handleLogin} loading={loading} authError={authError} />;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans overflow-hidden">
            <Sidebar view={view} setView={setView} user={user} />
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {view !== 'IMMERSIVE' && <Topbar toggleTheme={toggleTheme} theme={theme} title={view} />}
                <div className="flex-1 overflow-y-auto">
                    {view === 'DASHBOARD' && <DashboardContent data={data} apiKey={apiKey} setApiKey={setApiKey} />}
                    {view === 'ANALYTICS' && <AnalyticsContent data={data} apiKey={apiKey} />}
                    {view === 'REPORTS' && <ReportsContent reports={data?.reports} generateReport={generateReport} data={data} apiKey={apiKey} />}
                    {view === 'CUSTOMERS' && <CustomersContent customers={data?.customers} addCustomer={addCustomer} editCustomer={editCustomer} deleteCustomer={deleteCustomer} />}
                    {view === 'PROFILE' && <ProfileView user={user} setUser={setUser} />}
                    {view === 'SETTINGS' && <SettingsView theme={theme} toggleTheme={toggleTheme} apiKey={apiKey} setApiKey={setApiKey} />}
                    {view === 'IMMERSIVE' && <ImmersiveView data={data} />}
                </div>
            </main>
        </div>
    );
}
