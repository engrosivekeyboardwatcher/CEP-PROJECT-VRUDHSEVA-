import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function QRDemo() {
  const { t } = useLanguage();
  const [centre, setCentre] = useState('Madhurangan Old Age Home (sample)');
  const [contact, setContact] = useState('Emergency contact (demo)');

  const payload = `Vrudhseva ID tag\nCentre: ${centre}\nCall: ${contact}\nStay with the person. Demo only.`;

  return (
    <article className="card reveal" id="qr-demo">
      <h3>{t('qr_title')}</h3>
      <p>{t('qr_intro')}</p>
      <div className="split" style={{ marginTop: '1rem' }}>
        <form className="qr-form">
          <div className="field-group">
            <label htmlFor="qr-centre">{t('qr_centre')}</label>
            <input id="qr-centre" value={centre} onChange={(e) => setCentre(e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="qr-contact">{t('qr_contact')}</label>
            <input id="qr-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
        </form>

        <div className="wristband">
          <div id="qr-box">
            <QRCodeSVG value={payload} size={112} bgColor="#fff" fgColor="#1F6F78" />
          </div>
          <div>
            <div id="wb-centre" className="wristband-centre">{centre}</div>
            <div id="wb-contact" className="wristband-contact">{contact}</div>
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>{t('qr_print')}</button>
    </article>
  );
}
