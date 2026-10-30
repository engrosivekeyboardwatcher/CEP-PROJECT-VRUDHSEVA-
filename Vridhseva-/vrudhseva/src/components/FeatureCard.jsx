export default function FeatureCard({ feature, onOpen }) {
  return (
    <button type="button" className="card feature-card" onClick={onOpen}>
      <div className="icon-bubble" aria-hidden="true">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <span className="tag">{feature.categoryLabel}</span>
    </button>
  );
}
