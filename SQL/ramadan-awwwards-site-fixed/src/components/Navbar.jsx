import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { navLinks } from '../data/content';

const baseLink =
  'relative text-sm uppercase tracking-[0.3em] text-slate-200/75 transition duration-300 hover:text-amber-300';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/55 px-4 py-3 backdrop-blur-2xl md:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-amber-300 shadow-glow transition duration-300 group-hover:scale-125" />
          <span className="font-display text-xl tracking-[0.35em] text-slate-50 md:text-2xl">
            RAMADAN
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? 'text-amber-300' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-50 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/85 p-5 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.3em] transition ${
                      isActive
                        ? 'bg-amber-300/10 text-amber-300'
                        : 'bg-white/5 text-slate-200/80 hover:bg-white/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
