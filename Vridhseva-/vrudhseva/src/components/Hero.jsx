import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Hero() {
  const { t } = useLanguage();
  const revealRef = useScrollReveal();

  return (
    <section className="hero" id="home">
      <div className="blob blob-a" aria-hidden="true" />
      <div className="blob blob-b" aria-hidden="true" />
      <div className="blob blob-c" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="reveal in" ref={revealRef}>
          <p className="eyebrow">{t('hero_kicker')}</p>
          <h1>{t('hero_title')}</h1>
          <p className="lead">{t('hero_sub')}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#features">{t('cta_features')}</a>
            <a className="btn btn-accent" href="#involved">{t('cta_volunteer')}</a>
          </div>
        </div>
        <div className="hero-card reveal in">
          <svg className="hero-illustration" viewBox="0 0 420 280" role="img" aria-labelledby="hero-art-title">
            <title id="hero-art-title">Illustrated courtyard with caregivers and elderly residents</title>
            <rect width="420" height="280" rx="24" fill="#FFF8F0" />
            <ellipse cx="210" cy="230" rx="160" ry="28" fill="#E4EDE3" />
            <rect x="40" y="70" width="120" height="90" rx="16" fill="#D5E8EA" />
            <rect x="250" y="50" width="130" height="110" rx="16" fill="#F4A58A" opacity="0.55" />
            <circle cx="130" cy="150" r="28" fill="#1F6F78" />
            <circle cx="190" cy="158" r="32" fill="#8BA888" />
            <circle cx="258" cy="150" r="28" fill="#1F6F78" />
            <path d="M90 220c40-40 80-40 120 0" fill="none" stroke="#1F6F78" strokeWidth="6" strokeLinecap="round" />
            <text x="210" y="48" textAnchor="middle" fontSize="16" fill="#1F6F78" fontFamily="Poppins, sans-serif">Care with dignity</text>
          </svg>
          <p className="hero-note">{t('hero_note')}</p>
        </div>
      </div>
    </section>
  );
}
