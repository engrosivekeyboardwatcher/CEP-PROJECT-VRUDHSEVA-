import { useLanguage } from '../context/LanguageContext';

const trustPoints = [
  { title: 'Role-based access', body: 'Staff, coordinators, clinicians and volunteers see only what their role requires.' },
  { title: 'Consent records', body: 'When a person cannot consent, a guardian, home in-charge or authorised social worker is documented.' },
  { title: 'Audit logs', body: 'Lookups, edits and family contacts leave a trail that homes can review.' },
  { title: 'Human verification', body: 'All identity matches are verified by trained staff before anyone is contacted.' }
];

export default function PrivacyTrust() {
  const { t } = useLanguage();

  return (
    <section id="privacy" className="band-sage">
      <div className="wrap">
        <p className="section-kicker">{t('priv_kicker')}</p>
        <h2 className="section-title reveal">{t('priv_title')}</h2>
        <p className="section-intro reveal">{t('priv_body')}</p>
        <div className="cards-4">
          {trustPoints.map((point) => (
            <article className="card reveal" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
