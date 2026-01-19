import { Link } from 'react-router-dom';

export default function Work() {
    const projects = [
        {
            id: "vantage",
            title: "VANTAGE_PRO",
            desc: "Enterprise BI Platform",
            color: "bg-black text-white",
            textColor: "text-white",
            link: "/live/vantage"
        },
        {
            id: "spatial",
            title: "SPATIAL_OS",
            desc: "3D Architecture",
            color: "bg-accent-cyan",
            textColor: "text-black",
            link: "/live/spatial-platform"
        },
        {
            id: "neural",
            title: "NEURAL_VOID",
            desc: "WebGL Experiment",
            color: "bg-accent-purple",
            textColor: "text-black",
            link: "/live/neural-void"
        },
        {
            id: "focus",
            title: "FOCUS_FLOW",
            desc: "Pomodoro Timer",
            color: "bg-accent-yellow",
            textColor: "text-black",
            link: "/live/focus-flow"
        },
        {
            id: "neo",
            title: "NEO_BOARD",
            desc: "Kanban System",
            color: "bg-white",
            textColor: "text-black",
            link: "/live/neo-board"
        },
        {
            id: "type",
            title: "TYPE_FLOW",
            desc: "Typography Tool",
            color: "bg-accent-mint",
            textColor: "text-black",
            link: "/live/type-flow"
        }
    ];

    return (
        <section id="work" className="min-h-screen w-full flex flex-col justify-center px-6 md:px-24 py-24">
            <span className="bg-white border-2 border-black shadow-pop w-fit px-4 py-1 font-bold font-mono mb-12 transform -rotate-1 text-sm tracking-widest">
                FULL_STACK_ECOSYSTEM
            </span>

            <div className="grid gap-6 max-w-6xl mx-auto w-full">
                {projects.map((w, i) => (
                    <Link to={w.link} key={i} className={`group relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-200 cursor-none pointer-events-auto block overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-full h-full ${w.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                            <div>
                                <div className={`font-mono text-xs font-bold mb-2 flex items-center gap-2 ${w.id === 'vantage' ? 'text-accent-cyan' : 'text-gray-500'} group-hover:${w.textColor}`}>
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${w.id === 'vantage' ? 'bg-accent-cyan' : 'bg-green-500'}`} />
                                    {w.id === 'vantage' ? 'ENTERPRISE_READY' : 'ONLINE'}
                                </div>
                                <h3 className={`text-4xl md:text-5xl font-display font-black uppercase leading-none group-hover:${w.textColor} transition-colors`}>
                                    {w.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`font-bold font-mono text-xs border-2 border-black px-3 py-1 bg-white whitespace-nowrap hidden md:block group-hover:bg-black group-hover:text-white transition-colors`}>
                                    {w.desc}
                                </span>
                                <span className={`text-4xl group-hover:rotate-45 transition-transform duration-300 group-hover:${w.textColor}`}>
                                    ↗
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
