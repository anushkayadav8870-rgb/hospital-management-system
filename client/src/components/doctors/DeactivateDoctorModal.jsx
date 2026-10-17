// =============================================
// client/src/components/doctors/DeactivateDoctorModal.jsx
// Confirmation Modal for Safe Doctor Deactivation
// =============================================

import Button from '../common/Button';

export default function DeactivateDoctorModal({
  isOpen,
  onClose,
  onConfirm,
  doctor = null,
  isSubmitting = false,
  error = '',
}) {
  if (!isOpen || !doctor) return null;

  const doctorName =
    doctor.name ||
    `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() ||
    'Doctor';

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
        style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>Confirm Doctor Deactivation</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: 'var(--color-text-secondary)',
            }}
            aria-label="Close confirmation dialog"
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          {error && (
            <div
              className="alert alert-danger mb-4"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light)',
                color: '#991b1b',
                marginBottom: '16px',
              }}
            >
              <strong>Deactivation Error:</strong> {error}
            </div>
          )}

          <p style={{ marginBottom: '16px', fontSize: 'var(--font-size-base)', lineHeight: 1.5 }}>
            Are you sure you want to deactivate <strong>{doctorName}</strong>
            {doctor.specialization ? ` (${doctor.specialization})` : ''}?
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                marginBottom: '6px',
                color: 'var(--color-text-primary)',
              }}
            >
              🛡️ Historical Data Preservation Guarantee
            </div>
            <ul
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                paddingLeft: '18px',
                listStyleType: 'disc',
              }}
            >
              <li>This doctor will be hidden from the active staff directory and new booking selectors.</li>
              <li>
                All historical appointments, medical records (EMR), clinical notes, and prescriptions remain{' '}
                <strong>100% permanently preserved</strong> in the system.
              </li>
              <li>No database records will be erased or deleted.</li>
            </ul>
          </div>

          <div
            className="flex justify-end gap-3 pt-3"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
