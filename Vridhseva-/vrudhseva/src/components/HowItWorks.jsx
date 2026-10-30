import { timelineSteps } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorks() {
  const { t, language } = useLanguage();

  return (
    <section id="how">
      <div className="wrap">
        <p className="section-kicker">{t('nav_how')}</p>
        <h2 className="section-title reveal">{t('how_title')}</h2>
        <p className="section-intro reveal">{t('how_body')}</p>
        <div className="cards-3">
          {timelineSteps.map((step, index) => (
            <article className="card reveal" key={step.id}>
              <div className="step-number">0{index + 1}</div>
              <h3>{step.title[language]}</h3>
              <p>{step.body[language]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
