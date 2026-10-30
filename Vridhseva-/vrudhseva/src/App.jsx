import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Need from './components/Need';
import Features from './components/Features';
import EmergencyDemo from './components/EmergencyDemo';
import MemoryGame from './components/MemoryGame';
import MedicationTracker from './components/MedicationTracker';
import RegistryDemo from './components/RegistryDemo';
import QRDemo from './components/QRDemo';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import HowItWorks from './components/HowItWorks';
import Awareness from './components/Awareness';
import GetInvolved from './components/GetInvolved';
import PrivacyTrust from './components/PrivacyTrust';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import './App.css';

function AppContent() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vrudhseva-theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('vrudhseva-theme', theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <ScrollProgress />
      {loading && (
        <div className="app-loader" aria-live="polite" aria-busy="true">
          <div className="loader-heart" aria-hidden="true">
            <Heart size={30} />
          </div>
          <span>{t('loading')}</span>
        </div>
      )}

      <Navbar theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />

      <main className="page-shell">
        <Hero />
        <About />
        <Need />
        <Features />
        <section id="demos" className="band-sage">
          <div className="wrap demo-stack">
            <div className="section-heading">
              <p className="section-kicker">{t('demo_kicker')}</p>
              <h2 className="section-title reveal">{t('demo_title')}</h2>
              <p className="section-intro reveal">{t('demo_body')}</p>
            </div>
            <div className="demo-grid">
              <EmergencyDemo />
              <MemoryGame />
            </div>
            <div className="demo-grid wide">
              <MedicationTracker />
              <RegistryDemo />
            </div>
            <div className="demo-grid wide">
              <QRDemo />
              <AnalyticsDashboard />
            </div>
          </div>
        </section>
        <HowItWorks />
        <Awareness />
        <GetInvolved />
        <PrivacyTrust />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
