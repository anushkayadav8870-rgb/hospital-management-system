// =============================================
// client/src/components/emr/RecordModal.jsx
// Modal Form for Doctor Clinical Record Entry
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

export default function RecordModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    symptoms: '',
    diagnosis: '',
    treatmentPlan: '',
    doctorNotes: '',
  });

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
      setFormData({
        patientId: '',
        doctorId: '',
        symptoms: '',
        diagnosis: '',
        treatmentPlan: '',
        doctorNotes: '',
      });

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

          setFormData((prev) => ({
            ...prev,
            patientId: loadedPatients.length > 0 ? String(loadedPatients[0].id) : '',
            doctorId: loadedDoctors.length > 0 ? String(loadedDoctors[0].id) : '',
          }));

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
          console.error('Failed to load clinical record options:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patientId) {
      setError('Please select a patient.');
      return;
    }

    if (!formData.doctorId) {
      setError('Please select an attending doctor.');
      return;
    }

    if (!formData.symptoms.trim() || !formData.diagnosis.trim()) {
      setError('Please fill in required clinical fields (Symptoms & Primary Diagnosis).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        patientId: parseInt(formData.patientId, 10),
        doctorId: parseInt(formData.doctorId, 10),
        symptoms: formData.symptoms.trim(),
        diagnosis: formData.diagnosis.trim(),
        treatmentPlan: formData.treatmentPlan ? formData.treatmentPlan.trim() : null,
        doctorNotes: formData.doctorNotes ? formData.doctorNotes.trim() : null,
      });
    } catch (err) {
      setError(err.message || 'Failed to create medical record.');
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
        style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="card-title">📋 Add Clinical Medical Record</div>
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
            <div className="form-group mb-4">
              <label className="form-label">Patient *</label>
              {isLoadingOptions ? (
                <div className="text-sm text-muted">Loading active patients...</div>
              ) : (
                <select
                  className="form-input"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
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

            <div className="form-group mb-4">
              <label className="form-label">Attending Doctor *</label>
              {isLoadingOptions ? (
                <div className="text-sm text-muted">Loading active doctors...</div>
              ) : (
                <select
                  className="form-input"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
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

            <div className="form-group mb-4">
              <label className="form-label">Chief Symptoms & Complaints *</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Patient reported symptoms..."
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                {isSubmitting ? 'Saving Record...' : 'Save Clinical Record'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
