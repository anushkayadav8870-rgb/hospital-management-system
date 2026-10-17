// =============================================
// client/src/components/doctors/DoctorScheduleModal.jsx
// Modal Dialog for Viewing Doctor Consultation Schedules
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { doctorService } from '../../services/doctorService';

function formatTime(timeStr) {
  if (!timeStr) return '';
  // Handles 'HH:mm:ss' or 'HH:mm'
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

export default function DoctorScheduleModal({ isOpen, onClose, doctor = null }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (!isOpen || !doctor?.id) {
      setLoading(false);
      setError(null);
      setDoctorDetails(null);
      setSchedules([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchScheduleData = async () => {
      try {
        const res = await doctorService.getDoctorById(doctor.id);
        if (!isMounted) return;

        if (res.success && res.data) {
          setDoctorDetails(res.data);
          setSchedules(Array.isArray(res.data.schedules) ? res.data.schedules : []);
        } else {
          setError(res.message || 'Unable to retrieve doctor schedule details.');
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.data?.message || err.message || 'Failed to fetch doctor schedule.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchScheduleData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, doctor?.id]);

  if (!isOpen) return null;

  const currentDoctor = doctorDetails || doctor;
  const doctorName = currentDoctor?.name || (currentDoctor?.firstName ? `Dr. ${currentDoctor.firstName} ${currentDoctor.lastName}` : 'Doctor');
  const specialization = currentDoctor?.specialization || 'General Medicine';
  const deptName = currentDoctor?.department?.name || (typeof currentDoctor?.department === 'string' ? currentDoctor.department : 'General');
  const consultationFee = currentDoctor?.consultationFee != null ? Number(currentDoctor.consultationFee).toFixed(2) : null;

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
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <div className="card-title">📅 Doctor Consultation Schedule</div>
            <div className="text-sm text-muted">{doctorName} • {specialization}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
            aria-label="Close schedule modal"
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          {/* Doctor Brief Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: '20px',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}>
                👨‍⚕️
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{doctorName}</div>
                <div className="text-xs text-muted">
                  {deptName} Department {currentDoctor?.qualification ? `• ${currentDoctor.qualification}` : ''}
                </div>
              </div>
            </div>
            {consultationFee && (
              <div style={{ textAlign: 'right' }}>
                <div className="text-xs text-muted">Consultation Fee</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  ${consultationFee}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-muted" style={{ padding: '36px 0' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏳</div>
              <p className="font-semibold">Loading doctor schedule...</p>
              <p className="text-xs text-muted">Fetching hours and quota from database</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="alert alert-danger mb-4" style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: '#991b1b' }}>
              <strong>Error loading schedule:</strong> {error}
            </div>
          )}

          {/* Schedule Data / Empty State */}
          {!loading && !error && (
            <>
              {schedules.length > 0 ? (
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px' }}>
                    Active Weekly Schedule
                  </h4>
                  <div className="table-wrapper" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Day of Week</th>
                          <th>Consultation Hours</th>
                          <th style={{ textAlign: 'right' }}>Max Capacity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((item) => (
                          <tr key={item.id || item.day_of_week}>
                            <td className="font-semibold">{item.day_of_week}</td>
                            <td>
                              {formatTime(item.start_time)} – {formatTime(item.end_time)}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Badge variant="info">
                                {item.max_patients || '—'} patients
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Empty state: No custom schedule configured */}
                  <div
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      backgroundColor: 'var(--color-bg)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                      <strong style={{ fontSize: 'var(--font-size-sm)' }}>No Custom Schedule Configured</strong>
                    </div>
                    <p className="text-sm text-muted">
                      No custom weekly schedule has been registered in the system for this doctor yet.
                    </p>
                  </div>

                  {/* Reference default hospital hours explicitly labeled */}
                  <div
                    style={{
                      border: '1px dashed var(--color-border-strong)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      backgroundColor: 'var(--color-surface)',
                    }}
                  >
                    <div
                      className="text-xs font-semibold text-muted"
                      style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}
                    >
                      Default Clinic Hours (Reference Only)
                    </div>
                    <div className="flex justify-between text-sm py-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <span>Monday – Friday:</span>
                      <span className="font-semibold">09:00 AM – 05:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm py-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <span>Saturday:</span>
                      <span className="font-semibold">09:00 AM – 01:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <span>Sunday:</span>
                      <span className="text-muted">Closed / On-Call Emergency</span>
                    </div>
                    <div
                      className="text-xs text-muted"
                      style={{
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--color-border)',
                        fontStyle: 'italic',
                      }}
                    >
                      * Note: These default facility hours are provided for general reference only. They do not represent confirmed availability for this doctor.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modal Footer */}
          <div
            className="flex justify-end mt-6 pt-4"
            style={{ borderTop: '1px solid var(--color-border)', marginTop: '20px' }}
          >
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
