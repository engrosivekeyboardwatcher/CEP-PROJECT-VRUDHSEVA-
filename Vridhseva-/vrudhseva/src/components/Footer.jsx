import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <h3>Vrudhseva</h3>
          <p>{t('foot_blurb')}</p>
        </div>
        <div>
          <h3>{t('foot_links')}</h3>
          <p>
            <a href="#features">{t('nav_features')}</a><br />
            <a href="#involved">{t('cta_volunteer')}</a><br />
            <a href="#privacy">{t('priv_title')}</a><br />
            <a href="#awareness">{t('nav_awareness')}</a>
          </p>
        </div>
        <div>
          <h3>{t('foot_note')}</h3>
          <p>{t('foot_note_b')}</p>
        </div>
      </div>
      <p className="wrap credits">© 2026 Vrudhseva</p>
    </footer>
  );
}
