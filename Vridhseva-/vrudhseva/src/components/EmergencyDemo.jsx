import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const needs = [
  { key: 'pain', label: 'need_pain' },
  { key: 'water', label: 'need_water' },
  { key: 'food', label: 'need_food' },
  { key: 'bathroom', label: 'need_bath' },
  { key: 'fear', label: 'need_fear' },
  { key: 'medical', label: 'need_medical' }
];

export default function EmergencyDemo() {
  const { t } = useLanguage();
  const [scanMode, setScanMode] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [log, setLog] = useState([]);
  const [notice, setNotice] = useState('');
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!scanMode) return undefined;

    const interval = setInterval(() => {
      setScanIndex((current) => (current + 1) % needs.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [scanMode]);

  const notifyNeed = (needKey) => {
    const label = t(needs.find((need) => need.key === needKey)?.label || 'need_pain');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLog((current) => [{ time, label }, ...current].slice(0, 6));
    setNotice(t('caregiver_notified'));

    const timer = setTimeout(() => setNotice(''), 2800);
    timeoutsRef.current.push(timer);

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.56);
    } catch {
      // Audio is optional and should fail silently
    }
  };

  const activeNeed = needs[scanIndex];

  return (
    <article className="card reveal" id="emergency-demo">
      <h3>{t('em_title')}</h3>
      <p>{t('em_caption')}</p>
      <div className="demo-split" style={{ marginTop: '1rem' }}>
        <div className="tablet">
          <div className="tablet-bar" aria-hidden="true" />
          <div className="tablet-screen" id="tablet-screen">
            <div className="need-pad">
              {needs.map((need, index) => (
                <button
                  key={need.key}
                  type="button"
                  className={`need-btn ${need.key === activeNeed.key && scanMode ? 'scan-on' : ''} need-${need.key === 'bathroom' ? 'bath' : need.key === 'medical' ? 'med' : need.key}`}
                  data-need={need.key}
                  onClick={() => {
                    if (!scanMode) notifyNeed(need.key);
                  }}
                >
                  {t(need.label)}
                </button>
              ))}
            </div>
            <div className="scan-row">
              <button
                type="button"
                className="toggle"
                role="switch"
                aria-checked={scanMode}
                onClick={() => setScanMode((prev) => !prev)}
              >
                {scanMode ? 'On' : 'Off'}
              </button>
              <span>{t('scan_label')}</span>
            </div>
          </div>
        </div>
        <div>
          <h4>{t('alerts_title')}</h4>
          <p className="muted-text">{t('alerts_hint')}</p>
          <ul className="alerts">
            {log.map((item, index) => (
              <li key={`${item.time}-${index}`}>{item.time} · {item.label}</li>
            ))}
          </ul>
          {notice && <div className="notice-bar">{notice}</div>}
        </div>
      </div>
    </article>
  );
}
