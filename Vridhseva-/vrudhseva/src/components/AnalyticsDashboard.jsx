import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Activity,
  BrainCircuit,
  Droplets,
  Footprints,
  HeartPulse,
  ShieldAlert,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const barData = {
  labels: ['Pulse', 'Hydration', 'Mobility', 'Sleep', 'Nutrition'],
  datasets: [{
    label: 'Condition index',
    data: [74, 82, 68, 88, 79],
    backgroundColor: ['#1F6F78', '#6AA7A9', '#F4A58A', '#8DAE83', '#D65C5C'],
    borderRadius: 10,
  }]
};

const doughnutData = {
  labels: ['Stable', 'Watchlist', 'Critical'],
  datasets: [{
    data: [68, 24, 8],
    backgroundColor: ['#1F6F78', '#F4A58A', '#D65C5C'],
    borderWidth: 0,
  }]
};

const conditionCards = [
  { label: 'Stable', count: 14, accent: 'brand', icon: HeartPulse },
  { label: 'Watchlist', count: 4, accent: 'warm', icon: ShieldAlert },
  { label: 'Critical', count: 1, accent: 'danger', icon: BrainCircuit },
];

const residentConditions = [
  { resident: 'Anita Verma', score: 84, tag: 'Stable', icon: HeartPulse },
  { resident: 'Ramesh Naik', score: 66, tag: 'Watchlist', icon: Footprints },
  { resident: 'Shanta Bai', score: 91, tag: 'Stable', icon: Droplets },
  { resident: 'Mohan Joshi', score: 48, tag: 'Critical', icon: ShieldAlert },
];

export default function AnalyticsDashboard() {
  return (
    <article className="card reveal analytics-card">
      <div className="analytics-header">
        <div>
          <h3>Patient condition overview</h3>
          <p>Graphical indicators for hydration, mobility, mood, nutrition and risk trends.</p>
        </div>
        <span className="status-chip">Live care view</span>
      </div>

      <div className="metric-row">
        {conditionCards.map(({ label, count, accent, icon: Icon }) => (
          <div key={label} className={`mini-metric ${accent}`}>
            <div className="mini-metric-icon"><Icon size={18} /></div>
            <div>
              <strong>{count}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="chart-box">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, suggestedMax: 100 },
              },
            }}
          />
        </div>
        <div className="chart-box doughnut-box">
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
            }}
          />
        </div>
      </div>

      <div className="patient-monitor-list">
        {residentConditions.map(({ resident, score, tag, icon: Icon }) => (
          <div key={resident} className="condition-row">
            <div className="condition-head">
              <div className="condition-icon"><Icon size={16} /></div>
              <div>
                <strong>{resident}</strong>
                <span>{tag}</span>
              </div>
            </div>
            <div className="condition-score-wrap">
              <div className="condition-score-label">
                <span>Condition score</span>
                <strong>{score}%</strong>
              </div>
              <div className="condition-meter" aria-label={`${resident} condition score ${score}%`}>
                <span style={{ width: `${score}%` }} className={`meter-${tag.toLowerCase().replace(/\s+/g, '-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
