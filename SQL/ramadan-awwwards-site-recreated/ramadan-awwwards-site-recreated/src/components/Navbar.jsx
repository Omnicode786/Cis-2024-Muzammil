import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { Menu, MoonStar, SunMedium, X } from 'lucide-react';
import { navLinks } from '../data/content';
import { useTheme } from '../context/ThemeContext';

const baseLink =
  'relative text-sm uppercase tracking-[0.3em] transition duration-300 hover:text-[var(--theme-accent-strong)]';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[var(--theme-border)] bg-[var(--theme-bg-soft)] px-4 py-3 backdrop-blur-2xl md:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[var(--theme-accent)] shadow-[0_0_24px_rgba(250,204,21,0.85)] transition duration-300 group-hover:scale-125" />
          <span className="font-display text-xl tracking-[0.35em] text-[var(--theme-text)] md:text-2xl">
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
                `${baseLink} ${isActive ? 'text-[var(--theme-accent-strong)]' : 'text-[var(--theme-muted)]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] transition hover:scale-[1.03]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </button>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--theme-border)] text-[var(--theme-text)] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mx-auto mt-3 max-w-7xl rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-bg-soft)] p-5 backdrop-blur-2xl lg:hidden"
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
                        ? 'bg-[var(--theme-accent-soft)] text-[var(--theme-accent-strong)]'
                        : 'theme-chip text-[var(--theme-muted)] hover:bg-[var(--theme-surface-strong)]'
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
