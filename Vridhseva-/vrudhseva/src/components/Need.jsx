import { problemCards, timelineSteps } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';

export default function Need() {
  const { t, language } = useLanguage();
  const ref = useScrollReveal();

  const residents = useCountUp(20);
  const staff = useCountUp(5);
  const features = useCountUp(14);
  const langs = useCountUp(3);

  return (
    <section id="need" className="band-warm">
      <div className="wrap">
        <p className="section-kicker">{t('need_kicker')}</p>
        <h2 className="section-title reveal" ref={ref}>{t('need_title')}</h2>
        <p className="section-intro reveal">{t('need_body')}</p>

        <div className="cards-3">
          {problemCards.map((card) => (
            <article className="card reveal" key={card.title[language]}>
              <div className="icon-bubble" aria-hidden="true">{card.icon}</div>
              <h3>{card.title[language]}</h3>
              <p>{card.body[language]}</p>
            </article>
          ))}
        </div>

        <div className="stats" aria-label="Key figures from the field visit and platform">
          <div className="stat"><b>{`~${residents}`}</b><span>{t('stat_residents')}</span></div>
          <div className="stat"><b>{staff}</b><span>{t('stat_staff')}</span></div>
          <div className="stat"><b>{features}</b><span>{t('stat_features')}</span></div>
          <div className="stat"><b>{langs}</b><span>{t('stat_langs')}</span></div>
        </div>

        <div className="timeline">
          {timelineSteps.map((step) => (
            <div key={step.id} className="timeline-card reveal">
              <span className="timeline-step">{step.title[language]}</span>
              <p>{step.body[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
