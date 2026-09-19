// =============================================
// client/src/components/emr/RecordModal.jsx
// Modal Form for Doctor Clinical Record Entry
// =============================================

import { useState } from 'react';
import Button from '../common/Button';

export default function RecordModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientId: '1',
    doctorId: '1',
    symptoms: 'Mild stress-induced chest tightness during exercise',
    diagnosis: 'Mild Hypertension',
    treatmentPlan: 'Low-sodium diet, 25mg Atenolol daily, 30-day exercise log',
    doctorNotes: 'ECG results normal. Advised follow-up in 4 weeks.',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.symptoms || !formData.diagnosis) {
      setError('Please fill in required clinical fields (Symptoms & Primary Diagnosis).');
      return;
    }

    onSave(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="card-header">
          <div className="card-title">📋 Add Clinical Medical Record</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="form-label">Patient *</label>
              <select
                className="form-input"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                <option value="1">Eleanor Vance (PAT-2026-001)</option>
                <option value="2">Marcus Brody (PAT-2026-002)</option>
                <option value="3">Clara Oswald (PAT-2026-003)</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Attending Doctor *</label>
              <select
                className="form-input"
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="1">Dr. Sarah Jenkins (Cardiology)</option>
                <option value="2">Dr. Robert Chen (Pediatrics)</option>
                <option value="3">Dr. Emily Watson (Neurology)</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Chief Symptoms & Complaints *</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Patient reported symptoms..."
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Primary Diagnosis *</label>
              <input
                type="text"
                className="form-input"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="Clinical diagnosis..."
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Treatment Plan & Recommendations</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.treatmentPlan}
                onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                placeholder="Prescribed therapies, procedures, or lifestyle changes..."
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Doctor Examination Notes</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.doctorNotes}
                onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                placeholder="Internal clinical observations, lab/ECG results..."
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Clinical Record
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
