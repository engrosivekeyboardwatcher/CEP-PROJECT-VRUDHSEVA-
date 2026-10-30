export default function RegistryDemo() {
  return (
    <article className="card reveal">
      <h3>Resident Registry</h3>
      <p>Sample registry card showing records, family notes, and resident profile summary.</p>
      <div className="registry-grid">
        <div className="registry-box">
          <span className="badge">Resident A</span>
          <strong>Grace Fernandes</strong>
          <small>Room B-12 • Family contact ok</small>
        </div>
        <div className="registry-box">
          <span className="badge">Resident B</span>
          <strong>Raj Patil</strong>
          <small>Room C-07 • Mobility support</small>
        </div>
        <div className="registry-box">
          <span className="badge">Resident C</span>
          <strong>Shanta Bai</strong>
          <small>Room A-03 • Voice cues saved</small>
        </div>
      </div>
    </article>
  );
}
