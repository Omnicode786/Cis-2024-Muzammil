import { useEffect, useMemo, useState } from 'react';
import { Command, ExternalLink, Github, Linkedin, Mail, Search, X, type LucideIcon } from 'lucide-react';

type PaletteAction = {
  label: string;
  detail: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
};

const actions: PaletteAction[] = [
  { label: 'Open systems lab', detail: 'Jump to the cinematic hero', href: '#top', icon: Command },
  { label: 'Read origin story', detail: 'Electronics to Computer Systems Engineering', href: '#origin', icon: Search },
  { label: 'Explore tech tree', detail: 'Skills, systems, hardware, AI', href: '#tech-tree', icon: Command },
  { label: 'Open projects', detail: 'TrustLayer, RISC-V, demos, fintech security', href: '#projects', icon: ExternalLink },
  { label: 'Play Signal Breach', detail: 'Custom systems game before contact', href: '#signal-breach', icon: Command },
  { label: 'GitHub', detail: 'Omnicode786', href: 'https://github.com/Omnicode786', external: true, icon: Github },
  { label: 'LinkedIn', detail: 'Muzammil Mansoor Alam', href: 'https://pk.linkedin.com/in/muzammil-mansoor-alam-644a763b5', external: true, icon: Linkedin },
  { label: 'Email', detail: 'Start a build conversation', href: 'mailto:muzammil.alam@example.com', external: true, icon: Mail },
];

export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }

      if (event.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onOpenChange, open]);

  const filteredActions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return actions;
    return actions.filter((action) => `${action.label} ${action.detail}`.toLowerCase().includes(needle));
  }, [query]);

  const runAction = (action: PaletteAction) => {
    if (action.external) {
      window.location.href = action.href;
    } else {
      document.querySelector(action.href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onOpenChange(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 px-4 py-20 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="mx-auto max-w-2xl overflow-hidden border border-cyan-300/30 bg-[#061014]/95 shadow-[0_0_80px_rgba(0,229,255,0.18)]">
        <div className="flex items-center gap-3 border-b border-cyan-300/20 px-4 py-4">
          <Search size={18} className="text-cyan-200" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search systems, projects, socials..."
            className="h-10 flex-1 bg-transparent font-mono text-sm text-cyan-50 outline-none placeholder:text-cyan-100/35"
          />
          <button onClick={() => onOpenChange(false)} className="grid h-9 w-9 place-items-center border border-cyan-300/20 text-cyan-100 hover:bg-cyan-300 hover:text-black" aria-label="Close command palette">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => runAction(action)}
                className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border border-transparent px-4 py-4 text-left transition-colors hover:border-cyan-300/35 hover:bg-cyan-300/10"
              >
                <span className="grid h-10 w-10 place-items-center border border-cyan-300/20 text-cyan-200 group-hover:bg-cyan-300 group-hover:text-black">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-50">{action.label}</span>
                  <span className="mt-1 block text-sm text-cyan-100/55">{action.detail}</span>
                </span>
                <ExternalLink size={16} className="text-cyan-100/35" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
