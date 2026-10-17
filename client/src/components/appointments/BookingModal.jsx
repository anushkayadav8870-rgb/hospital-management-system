// =============================================
// client/src/components/appointments/BookingModal.jsx
// Modal Form for Booking New Patient Appointments
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

export default function BookingModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:30',
    reason: 'Routine Health Consultation',
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.searchable-select-container')) {
        setIsPatientDropdownOpen(false);
        setIsDoctorDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isOpen]);

  useEffect(() => {
    let isCurrent = true;

    if (isOpen) {
      setError('');
      setLoadError('');
      setIsLoadingOptions(true);

      Promise.all([
        patientService.getPatients(),
        doctorService.getDoctors(),
      ])
        .then(([patientsRes, doctorsRes]) => {
          if (!isCurrent) return;

          const loadedPatients =
            patientsRes.success && Array.isArray(patientsRes.data)
              ? patientsRes.data
              : [];
          const loadedDoctors =
            doctorsRes.success && Array.isArray(doctorsRes.data)
              ? doctorsRes.data
              : [];

          setPatients(loadedPatients);
          setDoctors(loadedDoctors);

          setFormData((prev) => ({
            ...prev,
            patientId:
              prev.patientId && loadedPatients.some((p) => String(p.id) === String(prev.patientId))
                ? prev.patientId
                : loadedPatients.length > 0
                ? String(loadedPatients[0].id)
                : '',
            doctorId:
              prev.doctorId && loadedDoctors.some((d) => String(d.id) === String(prev.doctorId))
                ? prev.doctorId
                : loadedDoctors.length > 0
                ? String(loadedDoctors[0].id)
                : '',
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
          console.error('Failed to load appointment booking options:', err);
          setLoadError(
            err.data?.message || err.message || 'Failed to load patients or doctors from the server.'
          );
        })
        .finally(() => {
          if (isCurrent) {
            setIsLoadingOptions(false);
          }
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

    if (loadError) {
      setError(loadError);
      return;
    }

    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return true;
    const term = patientSearch.trim().toLowerCase();
    const fullName = (p.name || '').toLowerCase();
    const firstName = (p.firstName || '').toLowerCase();
    const lastName = (p.lastName || '').toLowerCase();
    const mrn = (p.mrn || '').toLowerCase();
    const id = String(p.id || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return (
      fullName.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      mrn.includes(term) ||
      id.includes(term) ||
      phone.includes(term)
    );
  });

  const filteredDoctors = doctors.filter((d) => {
    if (!doctorSearch.trim()) return true;
    const term = doctorSearch.trim().toLowerCase();
    const name = (d.name || '').toLowerCase();
    const firstName = (d.firstName || '').toLowerCase();
    const lastName = (d.lastName || '').toLowerCase();
    const spec = (d.specialization || '').toLowerCase();
    const dept = typeof d.department === 'string'
      ? d.department.toLowerCase()
      : (d.department?.name || d.departmentName || '').toLowerCase();
    const id = String(d.id || '').toLowerCase();
    return (
      name.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      spec.includes(term) ||
      dept.includes(term) ||
      id.includes(term)
    );
  });

  const selectedPatientObj = patients.find(
    (p) => String(p.id) === String(formData.patientId)
  );

  const selectedDoctorObj = doctors.find(
    (d) => String(d.id) === String(formData.doctorId)
  );

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
        style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="card-header">
          <div className="card-title">📅 Schedule Patient Visit</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          {loadError && <div className="alert alert-danger mb-4">⚠️ {loadError}</div>}
          {error && <div className="alert alert-danger mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Searchable Patient Selector */}
            <div className="form-group mb-4 searchable-select-container" style={{ position: 'relative' }}>
              <label className="form-label">Select Patient *</label>
              
              {/* Trigger Button showing currently selected patient */}
              <div
                className="form-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isLoadingOptions || patients.length === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: isLoadingOptions || patients.length === 0 ? 'var(--color-bg)' : 'var(--color-surface)',
                  userSelect: 'none',
                }}
                onClick={() => {
                  if (!isLoadingOptions && patients.length > 0) {
                    setIsPatientDropdownOpen((prev) => !prev);
                    setIsDoctorDropdownOpen(false);
                  }
                }}
              >
                <span style={{ fontWeight: selectedPatientObj ? 500 : 400, color: selectedPatientObj ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {isLoadingOptions
                    ? 'Loading patient directory...'
                    : selectedPatientObj
                    ? `${selectedPatientObj.name} (${selectedPatientObj.mrn})`
                    : 'Choose a patient...'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {isPatientDropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Patient Dropdown Menu with Search */}
              {isPatientDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1050,
                    overflow: 'hidden',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🔍 Search patient by name, MRN, phone..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      autoFocus
                      style={{ padding: '6px 10px', fontSize: 'var(--font-size-sm)' }}
                    />
                  </div>

                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {filteredPatients.length === 0 ? (
                      <div style={{ padding: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        No patients matching "{patientSearch}"
                      </div>
                    ) : (
                      filteredPatients.map((p) => {
                        const isSelected = String(p.id) === String(formData.patientId);
                        return (
                          <div
                            key={p.id}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                              color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                              fontSize: 'var(--font-size-sm)',
                              borderBottom: '1px solid var(--color-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={() => {
                              setFormData({ ...formData, patientId: String(p.id) });
                              setIsPatientDropdownOpen(false);
                            }}
                          >
                            <div>
                              <strong style={{ display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                MRN: {p.mrn} {p.phone ? `• ${p.phone}` : ''}
                              </span>
                            </div>
                            {isSelected && <span style={{ fontWeight: 'bold' }}>✓</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Searchable Doctor Selector */}
            <div className="form-group mb-4 searchable-select-container" style={{ position: 'relative' }}>
              <label className="form-label">Select Consulting Doctor *</label>

              {/* Trigger Button showing currently selected doctor */}
              <div
                className="form-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isLoadingOptions || doctors.length === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: isLoadingOptions || doctors.length === 0 ? 'var(--color-bg)' : 'var(--color-surface)',
                  userSelect: 'none',
                }}
                onClick={() => {
                  if (!isLoadingOptions && doctors.length > 0) {
                    setIsDoctorDropdownOpen((prev) => !prev);
                    setIsPatientDropdownOpen(false);
                  }
                }}
              >
                <span style={{ fontWeight: selectedDoctorObj ? 500 : 400, color: selectedDoctorObj ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  {isLoadingOptions
                    ? 'Loading doctor directory...'
                    : selectedDoctorObj
                    ? `${selectedDoctorObj.name} ${selectedDoctorObj.specialization ? `(${selectedDoctorObj.specialization})` : ''}`
                    : 'Choose a doctor...'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {isDoctorDropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Doctor Dropdown Menu with Search */}
              {isDoctorDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border-strong)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1050,
                    overflow: 'hidden',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="🔍 Search doctor by name, specialization, ID..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      autoFocus
                      style={{ padding: '6px 10px', fontSize: 'var(--font-size-sm)' }}
                    />
                  </div>

                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {filteredDoctors.length === 0 ? (
                      <div style={{ padding: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        No doctors matching "{doctorSearch}"
                      </div>
                    ) : (
                      filteredDoctors.map((d) => {
                        const isSelected = String(d.id) === String(formData.doctorId);
                        return (
                          <div
                            key={d.id}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                              color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                              fontSize: 'var(--font-size-sm)',
                              borderBottom: '1px solid var(--color-border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={() => {
                              setFormData({ ...formData, doctorId: String(d.id) });
                              setIsDoctorDropdownOpen(false);
                            }}
                          >
                            <div>
                              <strong style={{ display: 'block' }}>{d.name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                {d.specialization ? `${d.specialization} ` : ''}(ID: {d.id})
                              </span>
                            </div>
                            {isSelected && <span style={{ fontWeight: 'bold' }}>✓</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Appointment Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Time Slot *</label>
                <select
                  className="form-input"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:15">10:15 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="01:30">01:30 PM</option>
                  <option value="02:45">02:45 PM</option>
                  <option value="03:30">03:30 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Reason for Visit</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Chief medical complaints or visit reason..."
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoadingOptions || Boolean(loadError)}
              >
                {isSubmitting ? 'Booking Visit...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
