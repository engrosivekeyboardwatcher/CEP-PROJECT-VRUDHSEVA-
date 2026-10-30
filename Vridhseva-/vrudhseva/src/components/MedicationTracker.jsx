import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, AlertTriangle, Pill, UserRound, BedDouble, Plus, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const initialMeds = [
  { id: 1, resident: 'Anita Verma', room: 'B-12', medicine: 'Amlodipine', dosage: '5mg', schedule: 'Morning - 8:00 AM', status: 'given' },
  { id: 2, resident: 'Ramesh Naik', room: 'C-07', medicine: 'Metformin', dosage: '500mg', schedule: 'Afternoon - 1:00 PM', status: 'delayed' },
  { id: 3, resident: 'Shanta Bai', room: 'A-03', medicine: 'Vitamin D', dosage: '400 IU', schedule: 'Evening - 7:30 PM', status: 'given' },
  { id: 4, resident: 'Mohan Joshi', room: 'D-11', medicine: 'Atorvastatin', dosage: '20mg', schedule: 'Morning - 8:00 AM', status: 'missed' },
  { id: 5, resident: 'Leela Sutar', room: 'E-04', medicine: 'Calcium', dosage: '500mg', schedule: 'Night - 9:15 PM', status: 'given' }
];

const statusMeta = {
  given: { label: 'Given', chip: 'chip-green', button: 'status-green', icon: CheckCircle2 },
  delayed: { label: 'Delayed', chip: 'chip-yellow', button: 'status-yellow', icon: Clock3 },
  missed: { label: 'Missed', chip: 'chip-red', button: 'status-red', icon: AlertTriangle }
};

export default function MedicationTracker() {
  const { t } = useLanguage();
  const [medications, setMedications] = useState(initialMeds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ resident: '', room: '', medicine: '', dosage: '', schedule: '', status: 'given' });

  const summary = useMemo(() => {
    const total = medications.length;
    const given = medications.filter((entry) => entry.status === 'given').length;
    const delayed = medications.filter((entry) => entry.status === 'delayed').length;
    const missed = medications.filter((entry) => entry.status === 'missed').length;
    const adherence = total ? Math.round((given / total) * 100) : 0;
    return { total, given, delayed, missed, adherence };
  }, [medications]);

  const updateStatus = (id, status) => {
    setMedications((current) => current.map((entry) => entry.id === id ? { ...entry, status } : entry));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMedications((current) => [{
      id: Date.now(),
      resident: formData.resident.trim() || 'New Resident',
      room: formData.room.trim() || 'Unassigned',
      medicine: formData.medicine.trim() || 'New Medication',
      dosage: formData.dosage.trim() || 'As prescribed',
      schedule: formData.schedule.trim() || 'Morning - 8:00 AM',
      status: formData.status || 'given'
    }, ...current]);
    setFormData({ resident: '', room: '', medicine: '', dosage: '', schedule: '', status: 'given' });
    setIsModalOpen(false);
  };

  return (
    <div className="medication-card">
      <div className="med-summary-grid">
        <div className="med-summary total"><span>Total</span><strong>{summary.total}</strong></div>
        <div className="med-summary given"><span>Given</span><strong>{summary.given}</strong></div>
        <div className="med-summary delayed"><span>Delayed</span><strong>{summary.delayed}</strong></div>
        <div className="med-summary missed"><span>Missed</span><strong>{summary.missed}</strong></div>
      </div>

      <div className="adherence-box">
        <div>
          <p className="adherence-label">{t('med_adhere').replace('{n}', summary.adherence)}</p>
          <p className="adherence-number">{summary.adherence}%</p>
        </div>
        <div className="progress-bar"><span style={{ width: `${summary.adherence}%` }} /></div>
      </div>

      <div className="med-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Medicine</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((entry) => {
              const MetaIcon = statusMeta[entry.status].icon;
              return (
                <tr key={entry.id}>
                  <td>
                    <div className="resident-cell">
                      <div className="avatar"><UserRound size={18} /></div>
                      <div>
                        <strong>{entry.resident}</strong>
                        <span><BedDouble size={14} /> {entry.room}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="drug-cell"><Pill size={15} /> {entry.medicine}</div>
                    <small>{entry.dosage}</small>
                  </td>
                  <td><div className="time-cell"><Clock3 size={14} /> {entry.schedule}</div></td>
                  <td>
                    <span className={`pill ${statusMeta[entry.status].chip}`}><MetaIcon size={14} /> {statusMeta[entry.status].label}</span>
                  </td>
                  <td>
                    <div className="status-buttons">
                      {Object.entries(statusMeta).map(([status, meta]) => {
                        const Icon = meta.icon;
                        const active = entry.status === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            className={`status-toggle ${active ? meta.button : ''}`}
                            aria-pressed={active}
                            onClick={() => updateStatus(entry.id, status)}
                          >
                            <Icon size={14} /> {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="med-action-row">
        <button type="button" className="btn btn-primary small" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add medication
        </button>
      </div>

      {isModalOpen && (
        <div className="modal open" role="dialog" aria-modal="true" aria-labelledby="med-form-title" onClick={(event) => event.target === event.currentTarget && setIsModalOpen(false)}>
          <div className="modal-card large">
            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close medication form">×</button>
            <div className="mb-2">
              <p className="section-kicker">New prescription</p>
              <h3 id="med-form-title">Add medication</h3>
            </div>
            <form onSubmit={handleSubmit} className="med-form">
              <div className="two-col">
                <label>
                  Resident name
                  <input name="resident" value={formData.resident} onChange={handleChange} required />
                </label>
                <label>
                  Room number
                  <input name="room" value={formData.room} onChange={handleChange} required />
                </label>
              </div>
              <div className="two-col">
                <label>
                  Medicine name
                  <input name="medicine" value={formData.medicine} onChange={handleChange} required />
                </label>
                <label>
                  Dosage
                  <input name="dosage" value={formData.dosage} onChange={handleChange} required />
                </label>
              </div>
              <div className="two-col">
                <label>
                  Schedule
                  <input name="schedule" value={formData.schedule} onChange={handleChange} required />
                </label>
                <label>
                  Status
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="given">Given</option>
                    <option value="delayed">Delayed</option>
                    <option value="missed">Missed</option>
                  </select>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
