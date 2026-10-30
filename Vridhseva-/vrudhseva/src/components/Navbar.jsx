import { useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`} id="site-nav">
      <div className="wrap nav-inner">
        <a className="logo" href="#home" aria-label="Vrudhseva home">
          <svg className="logo-mark" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="20" fill="#1F6F78" />
            <path d="M20 29c-6-4.4-10-8-10-12.2A5.2 5.2 0 0 1 20 14a5.2 5.2 0 0 1 10 2.8C30 21 26 24.6 20 29z" fill="#F4A58A" />
            <circle cx="20" cy="16.5" r="2.2" fill="#FFF8F0" />
          </svg>
          <span>Vrudhseva</span>
        </a>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={menuOpen}
          aria-controls="nav-panel"
          aria-label={menuOpen ? t('menu_close') : t('menu_open')}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>

        <div className={`nav-panel ${menuOpen ? 'open' : ''}`} id="nav-panel">
          <nav aria-label="Primary">
            <ul className="nav-links">
              <li><a href="#home" onClick={() => setMenuOpen(false)}>{t('nav_home')}</a></li>
              <li><a href="#about" onClick={() => setMenuOpen(false)}>{t('nav_about')}</a></li>
              <li><a href="#need" onClick={() => setMenuOpen(false)}>{t('nav_need')}</a></li>
              <li><a href="#features" onClick={() => setMenuOpen(false)}>{t('nav_features')}</a></li>
              <li><a href="#demos" onClick={() => setMenuOpen(false)}>{t('nav_demos')}</a></li>
              <li><a href="#how" onClick={() => setMenuOpen(false)}>{t('nav_how')}</a></li>
              <li><a href="#awareness" onClick={() => setMenuOpen(false)}>{t('nav_awareness')}</a></li>
              <li><a href="#involved" onClick={() => setMenuOpen(false)}>{t('nav_involved')}</a></li>
              <li><a href="#contact" onClick={() => setMenuOpen(false)}>{t('nav_contact')}</a></li>
            </ul>
          </nav>

          <div className="nav-tools">
            <LanguageSwitcher />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>
      </div>
    </header>
  );
}
