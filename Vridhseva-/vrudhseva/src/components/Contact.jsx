import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = form.name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.message.trim().length > 8;
    if (valid) {
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <section id="contact">
      <div className="wrap">
        <p className="section-kicker">{t('ct_kicker')}</p>
        <h2 className="section-title reveal">{t('ct_title')}</h2>
        <div className="split">
          <form className="card" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="c-name">{t('label_name')}</label>
              <input id="c-name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="c-email">{t('label_email')}</label>
              <input id="c-email" type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label htmlFor="c-msg">{t('label_msg')}</label>
              <textarea id="c-msg" rows="5" name="message" value={form.message} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary" type="submit">{t('btn_send')}</button>
            {submitted && <p className="success" role="status">{t('ct_thanks')}</p>}
          </form>

          <article className="card">
            <h3>{t('ct_reach')}</h3>
            <p>{t('ct_reach_b')}</p>
            <p style={{ marginTop: '0.8rem' }}>{t('ct_inspire')}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
