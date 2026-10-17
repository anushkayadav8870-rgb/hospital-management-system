// =============================================
// client/src/components/billing/CreateBillModal.jsx
// Modal Form for Generating New Hospital Invoices
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';

export default function CreateBillModal({ isOpen, onClose, onSave }) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [items, setItems] = useState([{ description: 'General Consultation Fee', amount: '' }]);

  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [appointmentLoadError, setAppointmentLoadError] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // 1. Load active patients when modal opens
  useEffect(() => {
    let isCurrent = true;

    if (isOpen) {
      setError('');
      setLoadError('');
      setAppointmentLoadError('');
      setPatientSearch('');
      setPatientId('');
      setAppointmentId('');
      setAppointments([]);
      setItems([{ description: 'General Consultation Fee', amount: '' }]);
      setIsLoadingPatients(true);

      patientService
        .getPatients({ limit: 100 })
        .then((res) => {
          if (!isCurrent) return;
          if (res.success && Array.isArray(res.data)) {
            const activePatients = res.data.filter((p) => p.isActive !== false);
            // Sort alphabetically by patient name for consistent, accessible selection
            activePatients.sort((a, b) => {
              const nameA = (a.name || `${a.firstName || ''} ${a.lastName || ''}`).toLowerCase();
              const nameB = (b.name || `${b.firstName || ''} ${b.lastName || ''}`).toLowerCase();
              return nameA.localeCompare(nameB);
            });
            setPatients(activePatients);
            if (activePatients.length === 0) {
              setLoadError('No active patients registered in the hospital.');
            }
          } else {
            setLoadError('Failed to load registered patients.');
          }
        })
        .catch((err) => {
          if (!isCurrent) return;
          setLoadError(err.data?.message || err.message || 'Unable to connect to patient records.');
        })
        .finally(() => {
          if (isCurrent) setIsLoadingPatients(false);
        });
    }

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  // 2. Load appointments whenever a patient is selected (with race-condition protection & auto-select)
  useEffect(() => {
    let isCurrent = true;

    // Immediately clear previous appointment selection and errors
    setAppointmentId('');
    setAppointments([]);
    setAppointmentLoadError('');

    if (patientId) {
      setIsLoadingAppointments(true);

      appointmentService
        .getAppointments({ patientId })
        .then((res) => {
          if (!isCurrent) return; // Prevent stale async response from overwriting newer patient selection
          if (res.success && Array.isArray(res.data)) {
            setAppointments(res.data);
            // If exactly one appointment is returned, auto-select it
            if (res.data.length === 1) {
              setAppointmentId(String(res.data[0].id));
            } else {
              setAppointmentId('');
            }
          } else {
            setAppointments([]);
            setAppointmentLoadError(res.message || 'Failed to load appointments for the selected patient.');
          }
        })
        .catch((err) => {
          if (!isCurrent) return;
          setAppointments([]);
          setAppointmentLoadError(
            err.data?.message || err.message || 'Unable to connect to appointment server.'
          );
        })
        .finally(() => {
          if (isCurrent) setIsLoadingAppointments(false);
        });
    } else {
      setIsLoadingAppointments(false);
    }

    return () => {
      isCurrent = false; // Invalidate current fetch if patientId changes before completion
    };
  }, [patientId]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculatedTotal = items.reduce((sum, item) => {
    const val = parseFloat(item.amount);
    return sum + (isNaN(val) || val <= 0 ? 0 : val);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (items.length === 0) {
      setError('At least one bill line item is required.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || !item.description.trim()) {
        setError(`Please enter a description for line item #${i + 1}.`);
        return;
      }
      const parsedAmount = parseFloat(item.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError(`Line item #${i + 1} must have a valid positive amount ($).`);
        return;
      }
    }

    if (calculatedTotal <= 0) {
      setError('Total invoice amount must be greater than $0.00.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        patientId: parseInt(patientId, 10),
        appointmentId: appointmentId ? parseInt(appointmentId, 10) : null,
        items: items.map((i) => ({
          description: i.description.trim(),
          amount: parseFloat(parseFloat(i.amount).toFixed(2)),
        })),
      });
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to generate hospital invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return true;
    const term = patientSearch.trim().toLowerCase();
    const fullName = (p.name || `${p.firstName || ''} ${p.lastName || ''}`).toLowerCase();
    const mrn = (p.mrn || '').toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return fullName.includes(term) || mrn.includes(term) || phone.includes(term);
  });

  // Ensure currently selected patient remains visible in options even if filtered
  const displayedPatients = [...filteredPatients];
  if (patientId && !displayedPatients.some((p) => String(p.id) === String(patientId))) {
    const selectedObj = patients.find((p) => String(p.id) === String(patientId));
    if (selectedObj) displayedPatients.unshift(selectedObj);
  }

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
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="card-header flex justify-between items-center">
          <div className="card-title">🧾 Issue Hospital Invoice</div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div className="card-body" style={{ overflowY: 'auto' }}>
          {loadError && <div className="alert alert-danger mb-4">{loadError}</div>}
          {error && <div className="alert alert-danger mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <div className="form-group mb-4">
              <label className="form-label">Select Patient *</label>
              {patients.length > 5 && (
                <input
                  type="text"
                  className="form-input mb-2"
                  placeholder="🔍 Type to filter patients by name, MRN, or phone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  disabled={isLoadingPatients || isSubmitting}
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                />
              )}
              <select
                className="form-input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={isLoadingPatients || isSubmitting}
                required
              >
                <option value="">
                  {isLoadingPatients ? 'Loading registered patients...' : '-- Choose Patient --'}
                </option>
                {displayedPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || `${p.firstName} ${p.lastName}`} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Appointment Linking */}
            <div className="form-group mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Associated Appointment (Optional)
                </label>
                {patientId && !isLoadingAppointments && !appointmentLoadError && appointments.length > 0 && (
                  <span
                    className="badge badge-primary text-xs"
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {appointments.length} appointment{appointments.length > 1 ? 's' : ''} available
                  </span>
                )}
              </div>

              <select
                className="form-input"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                disabled={!patientId || isLoadingAppointments || isSubmitting}
              >
                {!patientId ? (
                  <option value="">-- Select a patient first --</option>
                ) : isLoadingAppointments ? (
                  <option value="">⏳ Loading appointments for selected patient...</option>
                ) : appointments.length === 0 ? (
                  <option value="">-- No appointments found (Direct Invoicing / Outpatient) --</option>
                ) : (
                  <>
                    <option value="">-- Direct Invoicing / Outpatient (No appointment link) --</option>
                    {appointments.map((apt) => {
                      const displayDate = apt.date
                        ? (typeof apt.date === 'string'
                            ? apt.date.split('T')[0]
                            : new Date(apt.date).toISOString().split('T')[0])
                        : 'N/A';
                      const doctorInfo = apt.doctor?.name ? ` | ${apt.doctor.name}` : '';
                      return (
                        <option key={apt.id} value={apt.id}>
                          #APT-{apt.id.toString().padStart(4, '0')} | {displayDate}{doctorInfo} | {apt.reason || 'Consultation'} ({apt.status})
                        </option>
                      );
                    })}
                  </>
                )}
              </select>

              {/* Status, Empty State & Inline Feedback Messages */}
              {isLoadingAppointments && (
                <span className="text-xs text-muted block mt-1">
                  ⏳ Fetching appointment records from database...
                </span>
              )}

              {appointmentLoadError && (
                <div className="text-xs block mt-1" style={{ color: 'var(--color-danger)' }}>
                  ⚠️ {appointmentLoadError}
                </div>
              )}

              {patientId && appointments.length === 0 && !isLoadingAppointments && !appointmentLoadError && (
                <span className="text-xs text-muted block mt-1">
                  ℹ️ No appointments recorded for this patient. You can still generate a direct bill.
                </span>
              )}

              {patientId && appointments.length === 1 && !isLoadingAppointments && !appointmentLoadError && (
                <span className="text-xs block mt-1" style={{ color: 'var(--color-success)' }}>
                  ✓ Exactly 1 appointment found and automatically selected (#APT-{appointments[0].id.toString().padStart(4, '0')}).
                </span>
              )}

              {patientId && appointments.length > 1 && !isLoadingAppointments && !appointmentLoadError && (
                <span className="text-xs text-muted block mt-1">
                  ℹ️ Found {appointments.length} appointments. Select one to link or leave as direct invoicing.
                </span>
              )}
            </div>

            {/* Line Items Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Invoice Line Items *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={isSubmitting}
                >
                  + Add Line Item
                </Button>
              </div>

              <div className="flex-col gap-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 140px 40px',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--color-bg)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Consultation Fee, Blood Panel, ECG..."
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-input"
                        placeholder="Amount ($)"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1 || isSubmitting}
                        title="Remove item"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: items.length > 1 ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                          cursor: items.length > 1 ? 'pointer' : 'not-allowed',
                          fontSize: '1.1rem',
                          padding: '4px',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Balance Preview */}
            <div
              className="flex justify-between items-center mb-6"
              style={{
                background: 'var(--color-bg)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--color-primary)',
              }}
            >
              <span className="font-semibold text-sm">Calculated Invoice Total:</span>
              <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                ${calculatedTotal.toFixed(2)}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoadingPatients || Boolean(loadError)}
              >
                {isSubmitting ? 'Generating Invoice...' : 'Confirm & Issue Invoice'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
