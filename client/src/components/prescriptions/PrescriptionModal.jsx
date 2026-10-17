// =============================================
// client/src/components/prescriptions/PrescriptionModal.jsx
// Modal Dialog Form for Multi-Item Prescription Orders
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

export default function PrescriptionModal({ isOpen, onClose, onSave }) {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [items, setItems] = useState([
    { medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 days' },
  ]);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (isOpen) {
      setError('');
      setLoadError('');
      setIsLoadingOptions(true);
      setInstructions('');
      setItems([
        { medicineName: '', dosage: '', frequency: 'Once daily', duration: '7 days' },
      ]);

      Promise.all([patientService.getPatients(), doctorService.getDoctors()])
        .then(([patientsRes, doctorsRes]) => {
          if (!isCurrent) return;

          const loadedPatients =
            patientsRes.success && Array.isArray(patientsRes.data)
              ? patientsRes.data.filter((p) => p.isActive !== false)
              : [];
          const loadedDoctors =
            doctorsRes.success && Array.isArray(doctorsRes.data)
              ? doctorsRes.data.filter((d) => d.isActive !== false)
              : [];

          setPatients(loadedPatients);
          setDoctors(loadedDoctors);

          setPatientId(loadedPatients.length > 0 ? String(loadedPatients[0].id) : '');
          setDoctorId(loadedDoctors.length > 0 ? String(loadedDoctors[0].id) : '');

          if (loadedPatients.length === 0 || loadedDoctors.length === 0) {
            if (loadedPatients.length === 0 && loadedDoctors.length === 0) {
              setLoadError('No active patients or doctors found in the database.');
            } else if (loadedPatients.length === 0) {
              setLoadError('No active patients found in the database. Please register a patient first.');
            } else {
              setLoadError('No active doctors found in the database.');
            }
          }
        })
        .catch((err) => {
          if (!isCurrent) return;
          console.error('Failed to load prescription options:', err);
          setLoadError(err.data?.message || err.message || 'Failed to load patients or doctors.');
        })
        .finally(() => {
          if (isCurrent) setIsLoadingOptions(false);
        });
    }

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (!doctorId) {
      setError('Please select a prescribing doctor.');
      return;
    }

    if (!items || items.length === 0) {
      setError('Please add at least one medication item.');
      return;
    }

    const invalid = items.some(
      (i) => !i.medicineName?.trim() || !i.dosage?.trim() || !i.frequency?.trim()
    );
    if (invalid) {
      setError('Please fill in medicine name, dosage, and frequency for all medication items.');
      return;
    }

    const sanitizedItems = items.map((i) => ({
      medicineName: i.medicineName.trim(),
      dosage: i.dosage.trim(),
      frequency: i.frequency.trim(),
      duration: i.duration?.trim() || '7 days',
    }));

    try {
      setIsSubmitting(true);
      await onSave({
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(doctorId, 10),
        instructions: instructions.trim() || null,
        items: sanitizedItems,
      });
    } catch (err) {
      setError(err.message || 'Failed to create prescription order.');
    } finally {
      setIsSubmitting(false);
    }
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
      onClick={!isSubmitting ? onClose : undefined}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="card-title">💊 Write New Medication Prescription</div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger mb-4">{error}</div>}
          {loadError && <div className="alert alert-warning mb-4">{loadError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Patient *</label>
                {isLoadingOptions ? (
                  <div className="text-sm text-muted">Loading active patients...</div>
                ) : (
                  <select
                    className="form-input"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    disabled={isSubmitting || patients.length === 0}
                    required
                  >
                    {patients.length === 0 ? (
                      <option value="">No active patients available</option>
                    ) : (
                      patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.mrn})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div className="form-group w-full">
                <label className="form-label">Prescribing Doctor *</label>
                {isLoadingOptions ? (
                  <div className="text-sm text-muted">Loading active doctors...</div>
                ) : (
                  <select
                    className="form-input"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    disabled={isSubmitting || doctors.length === 0}
                    required
                  >
                    {doctors.length === 0 ? (
                      <option value="">No active doctors available</option>
                    ) : (
                      doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialization || d.department?.name || 'General'})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* Prescribed Items Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label" style={{ margin: 0 }}>
                  Medication Orders ({items.length}) *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={isSubmitting}
                >
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
                          disabled={isSubmitting}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-danger)',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          }}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Drug Name (e.g. Atenolol) *"
                        value={item.medicineName}
                        onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Dosage (e.g. 25mg) *"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Frequency (e.g. Once daily) *"
                        value={item.frequency}
                        onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Duration (e.g. 30 days)"
                        value={item.duration}
                        onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                        disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoadingOptions || patients.length === 0 || doctors.length === 0}
              >
                {isSubmitting ? 'Issuing Order...' : 'Issue Prescription Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
