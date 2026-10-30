import { useState } from 'react';
import { donationNeeds, volunteerOptions } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

export default function GetInvolved() {
  const { t, language } = useLanguage();
  const [volunteerForm, setVolunteerForm] = useState({ name: '', phone: '', email: '', interest: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleVolunteerChange = (e) => {
    const { name, value } = e.target;
    setVolunteerForm((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    return volunteerForm.name.trim().length > 1 && /^[6-9]\d{9}$/.test(volunteerForm.phone.replace(/\s+/g, '')) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(volunteerForm.email) && volunteerForm.interest;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
      setVolunteerForm({ name: '', phone: '', email: '', interest: '' });
    }
  };

  return (
    <section id="involved">
      <div className="wrap">
        <p className="section-kicker">Hands, time and care</p>
        <h2 className="section-title reveal">{t('inv_title')}</h2>
        <p className="section-intro reveal">{t('inv_body')}</p>

        <div className="split">
          <form className="card" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="v-name">{t('label_name')}</label>
              <input id="v-name" name="name" value={volunteerForm.name} onChange={handleVolunteerChange} required />
            </div>
            <div className="field">
              <label htmlFor="v-phone">{t('label_phone')}</label>
              <input id="v-phone" name="phone" value={volunteerForm.phone} onChange={handleVolunteerChange} required />
            </div>
            <div className="field">
              <label htmlFor="v-email">{t('label_email')}</label>
              <input id="v-email" type="email" name="email" value={volunteerForm.email} onChange={handleVolunteerChange} required />
            </div>
            <div className="field">
              <label htmlFor="v-interest">{t('label_interest')}</label>
              <select id="v-interest" name="interest" value={volunteerForm.interest} onChange={handleVolunteerChange} required>
                <option value="">{t('interest_choose')}</option>
                {volunteerOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option[language]}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit">{t('btn_volunteer')}</button>
            {submitted && <p className="success" role="status">{t('vol_thanks')}</p>}
          </form>

          <div className="card">
            <h3>{t('donor_needs')}</h3>
            <p className="muted-text">{t('donor_intro')}</p>
            {donationNeeds.map((item) => (
              <div className="need-row" key={item.label.en}>
                <header>
                  <span>{item.label[language]}</span>
                  <span>{item.value}%</span>
                </header>
                <div className="bar" role="progressbar" aria-valuenow={item.value} aria-valuemin="0" aria-valuemax="100">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
