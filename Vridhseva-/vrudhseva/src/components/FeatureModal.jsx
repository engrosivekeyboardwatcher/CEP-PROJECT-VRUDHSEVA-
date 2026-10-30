export default function FeatureModal({ feature, onClose }) {
  if (!feature) return null;

  return (
    <div className="modal open" role="dialog" aria-modal="true" aria-labelledby="feature-modal-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close feature details">×</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="icon-bubble" aria-hidden="true" style={{ marginBottom: 0 }}>{feature.icon}</span>
          <h3 id="feature-modal-title" style={{ margin: 0 }}>{feature.title}</h3>
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>{feature.description}</p>
      </div>
    </div>
  );
}
