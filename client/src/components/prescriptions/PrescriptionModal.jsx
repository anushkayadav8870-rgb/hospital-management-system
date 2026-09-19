// =============================================
// client/src/components/prescriptions/PrescriptionModal.jsx
// Modal Dialog Form for Multi-Item Prescription Orders
// =============================================

import { useState } from 'react';
import Button from '../common/Button';

export default function PrescriptionModal({ isOpen, onClose, onSave }) {
  const [patientId, setPatientId] = useState('1');
  const [doctorId, setDoctorId] = useState('1');
  const [instructions, setInstructions] = useState('Take all medications as directed after meals.');
  const [items, setItems] = useState([
    { medicineName: 'Atenolol', dosage: '25mg', frequency: 'Once daily (Morning)', duration: '30 days' },
    { medicineName: 'Multivitamin Complex', dosage: '1 Tablet', frequency: 'Once daily', duration: '60 days' },
  ]);

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { medicineName: '', dosage: '', frequency: 'Twice daily', duration: '7 days' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const invalid = items.some((i) => !i.medicineName || !i.dosage || !i.frequency);
    if (invalid) {
      setError('Please fill in medicine name, dosage, and frequency for all items.');
      return;
    }

    onSave({
      patientId,
      doctorId,
      instructions,
      items,
    });
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
        style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="card-header">
          <div className="card-title">💊 Write New Medication Prescription</div>
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
            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Patient *</label>
                <select
                  className="form-input"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                >
                  <option value="1">Eleanor Vance (PAT-2026-001)</option>
                  <option value="2">Marcus Brody (PAT-2026-002)</option>
                  <option value="3">Clara Oswald (PAT-2026-003)</option>
                </select>
              </div>

              <div className="form-group w-full">
                <label className="form-label">Prescribing Doctor *</label>
                <select
                  className="form-input"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  <option value="1">Dr. Sarah Jenkins (Cardiology)</option>
                  <option value="2">Dr. Robert Chen (Pediatrics)</option>
                  <option value="3">Dr. Emily Watson (Neurology)</option>
                </select>
              </div>
            </div>

            {/* Prescribed Items Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label" style={{ margin: 0 }}>
                  Medication Orders ({items.length})
                </label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  + Add Medicine
                </Button>
              </div>

              <div className="flex-col gap-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'var(--color-bg)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex justify-between items-center mb-2 text-xs font-bold text-muted">
                      <span>MEDICINE ITEM #{index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Drug Name (e.g. Atenolol)"
                        value={item.medicineName}
                        onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Dosage (e.g. 25mg)"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Frequency (e.g. Once daily)"
                        value={item.frequency}
                        onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Duration (e.g. 30 days)"
                        value={item.duration}
                        onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Special Administration Instructions</label>
              <textarea
                className="form-input"
                rows="2"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take with food. Avoid driving..."
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Issue Prescription Order
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
