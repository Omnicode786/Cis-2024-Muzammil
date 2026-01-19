import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CustomCursor from '../components/ui/CustomCursor';

export default function ProjectPage() {
    const { id } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    return (
        <>
            <CustomCursor />
            <div className="min-h-screen w-full bg-[#FFFBF0] text-primary select-none">

                {/* Nav / Back Button */}
                <nav className="fixed top-0 left-0 w-full p-8 z-50 mix-blend-difference pointer-events-none">
                    <Link to="/" className="inline-block pointer-events-auto font-mono font-bold text-xl hover:text-accent-cyan transition-colors cursor-none">
                        ← BACK
                    </Link>
                </nav>

                {/* Header */}
                <header className="pt-32 px-6 md:px-24">
                    <span className="bg-accent-purple border-2 border-black px-4 py-1 font-mono font-bold text-white shadow-pop mb-6 inline-block">
                        CASE_STUDY_0{id}
                    </span>
                    <h1 className="text-6xl md:text-9xl font-black font-display leading-[0.8] mb-12">
                        PROJECT <br />
                        <span className="text-accent-red text-stroke-black">NAME</span>
                    </h1>
                </header>

                {/* Content Grid */}
                <main className="px-6 md:px-24 pb-24 grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Sidebar Details */}
                    <aside className="md:col-span-1 space-y-8 font-mono border-t-2 border-black pt-8">
                        <div>
                            <h3 className="font-bold text-secondary mb-2 text-xs uppercase tracking-widest">ROLE</h3>
                            <p className="text-xl font-bold">Front-end Engineer</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-secondary mb-2 text-xs uppercase tracking-widest">STACK</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white border text-xs font-bold px-2 py-1">React</span>
                                <span className="bg-white border text-xs font-bold px-2 py-1">WebGL</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-secondary mb-2 text-xs uppercase tracking-widest">YEAR</h3>
                            <p className="text-xl font-bold">2025</p>
                        </div>

                        <a href="#" className="block w-full bg-black text-white text-center py-4 font-bold border-2 border-transparent hover:bg-accent-yellow hover:text-black hover:border-black transition-colors cursor-none shadow-pop">
                            VISIT LIVE SITE ↗
                        </a>
                    </aside>

                    {/* Main Content */}
                    <article className="md:col-span-2 space-y-12">
                        <div className="w-full aspect-video bg-gray-200 border-2 border-black shadow-pop rounded-lg overflow-hidden">
                            {/* Placeholder for project image */}
                            <div className="w-full h-full bg-accent-cyan flex items-center justify-center font-display font-bold text-4xl opacity-50">
                                HERO_IMAGE
                            </div>
                        </div>

                        <div className="prose prose-lg font-sans max-w-none">
                            <h2 className="font-display font-bold text-4xl mb-6">The Concept</h2>
                            <p>
                                This is where the story of the project goes. Describe the challenge, the solution, and the impact.
                                Keep it punchy. Use <strong>bold text</strong> for emphasis. The design should be brutalist yet readable.
                            </p>
                            <p>
                                We implemented a custom physics engine to handle the interactions...
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-square bg-accent-pink border-2 border-black rounded-lg"></div>
                            <div className="aspect-square bg-accent-yellow border-2 border-black rounded-lg"></div>
                        </div>
                    </article>

                </main>

                <section className="bg-black py-24 text-center">
                    <h2 className="text-white font-display font-bold text-4xl mb-8">NEXT PROJECT</h2>
                    <Link to="/project/2" className="text-6xl md:text-8xl font-black text-transparent text-stroke-white hover:text-accent-mint transition-colors cursor-none">
                        NEURAL VOID
                    </Link>
                </section>

            </div>
        </>
    );
}
