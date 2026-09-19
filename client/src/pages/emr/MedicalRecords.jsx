// =============================================
// client/src/pages/emr/MedicalRecords.jsx
// Electronic Medical Records (EMR) Directory View
// =============================================

import { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import RecordModal from '../../components/emr/RecordModal';

const initialRecords = [
  {
    id: 1,
    patientName: 'Eleanor Vance',
    mrn: 'PAT-2026-001',
    doctorName: 'Dr. Sarah Jenkins',
    specialization: 'Cardiology',
    date: '2026-09-15',
    symptoms: 'Mild chest tightness during exercise, fatigue',
    diagnosis: 'Mild Stress-Induced Hypertension',
    treatmentPlan: 'Low-sodium diet, 25mg Atenolol daily, 30-day exercise log',
    doctorNotes: 'ECG normal. Re-evaluate in 30 days.',
  },
  {
    id: 2,
    patientName: 'Marcus Brody',
    mrn: 'PAT-2026-002',
    doctorName: 'Dr. Robert Chen',
    specialization: 'Pediatrics',
    date: '2026-09-12',
    symptoms: 'Seasonal allergic rhinitis, mild nasal congestion',
    diagnosis: 'Allergic Rhinitis',
    treatmentPlan: 'Antihistamine 10mg daily as needed',
    doctorNotes: 'No fever or respiratory distress.',
  },
];

export default function MedicalRecords() {
  const [records, setRecords] = useState(initialRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRecords = records.filter(
    (r) =>
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveRecord = (formData) => {
    const newRecord = {
      id: Date.now(),
      patientName: formData.patientId === '1' ? 'Eleanor Vance' : formData.patientId === '2' ? 'Marcus Brody' : 'Clara Oswald',
      mrn: `PAT-2026-00${formData.patientId}`,
      doctorName: formData.doctorId === '1' ? 'Dr. Sarah Jenkins' : 'Dr. Robert Chen',
      specialization: formData.doctorId === '1' ? 'Cardiology' : 'Pediatrics',
      date: new Date().toISOString().split('T')[0],
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatmentPlan: formData.treatmentPlan,
      doctorNotes: formData.doctorNotes,
    };

    setRecords([newRecord, ...records]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Electronic Medical Records (EMR)</h1>
          <p>Clinical histories, diagnoses, treatment plans, and doctor examination notes.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Clinical Record
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="card mb-6" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search records by patient, MRN, or diagnosis..."
            style={{ maxWidth: '400px' }}
          />
        </div>
      </div>

      {/* EMR Cards List */}
      <div className="flex-col gap-5">
        {filteredRecords.length === 0 ? (
          <div className="card">
            <div className="card-body empty-state">
              <p>No medical records found matching "{searchTerm}".</p>
            </div>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div key={rec.id} className="card">
              <div className="card-header">
                <div>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{rec.patientName}</span>
                  <span className="text-sm text-muted" style={{ marginLeft: '12px' }}>MRN: {rec.mrn}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info">{rec.date}</Badge>
                  <span className="text-sm font-semibold">{rec.doctorName} ({rec.specialization})</span>
                </div>
              </div>

              <div className="card-body flex-col gap-4">
                <div>
                  <div className="text-xs text-muted uppercase font-bold mb-1">Primary Diagnosis</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                    {rec.diagnosis}
                  </div>
                </div>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xs text-muted uppercase font-bold mb-1">Symptoms Reported</div>
                    <div className="text-sm">{rec.symptoms}</div>
                  </div>

                  <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xs text-muted uppercase font-bold mb-1">Treatment Plan</div>
                    <div className="text-sm">{rec.treatmentPlan || 'None specified.'}</div>
                  </div>
                </div>

                {rec.doctorNotes && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                    <span className="text-xs text-muted uppercase font-bold">Doctor Examination Notes: </span>
                    <span className="text-sm text-muted">{rec.doctorNotes}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Creation Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
      />
    </div>
  );
}
