import { aboutCards } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function About() {
  const { t, language } = useLanguage();
  const ref = useScrollReveal();

  return (
    <section id="about">
      <div className="wrap">
        <p className="section-kicker">{t('about_kicker')}</p>
        <h2 className="section-title reveal" ref={ref}>{t('about_title')}</h2>
        <p className="section-intro reveal">{t('about_body')}</p>
        <div className="cards-3">
          {aboutCards.map((card) => (
            <article className="card reveal" key={card.title[language]}>
              <div className="icon-bubble" aria-hidden="true">{card.icon}</div>
              <h3>{card.title[language]}</h3>
              <p>{card.body[language]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
