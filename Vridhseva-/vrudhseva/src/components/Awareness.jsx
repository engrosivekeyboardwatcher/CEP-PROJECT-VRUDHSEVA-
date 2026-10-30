import { useState } from 'react';
import { mythCards } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

export default function Awareness() {
  const { t, language } = useLanguage();
  const [flipped, setFlipped] = useState([]);

  const toggleCard = (index) => {
    setFlipped((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  };

  return (
    <section id="awareness" className="band-warm">
      <div className="wrap">
        <p className="section-kicker">Learn with kindness</p>
        <h2 className="section-title reveal">{t('aw_title')}</h2>
        <p className="section-intro reveal">{t('aw_body')}</p>
        <div className="flip-grid">
          {mythCards.map((card, index) => {
            const open = flipped.includes(index);
            return (
              <button
                key={`${card.myth[language]}-${index}`}
                type="button"
                className={`flip ${open ? 'open' : ''}`}
                aria-expanded={open}
                onClick={() => toggleCard(index)}
              >
                <span className="flip-inner">
                  <span className="flip-face flip-front">
                    <span className="mini-icon">{card.icon}</span>
                    <strong>{card.myth[language]}</strong>
                  </span>
                  <span className="flip-face flip-back">
                    <strong>Fact</strong>
                    <span>{card.fact[language]}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
