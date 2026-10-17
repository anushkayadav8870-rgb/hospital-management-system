import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BookingModal from '../../components/appointments/BookingModal';
import { appointmentService } from '../../services/appointmentService';

const statusVariantMap = {
  Completed: 'success',
  Confirmed: 'primary',
  Scheduled: 'warning',
  Cancelled: 'danger',
  'No-Show': 'neutral',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const res = await appointmentService.getAppointments(filters);
      if (res.success && Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setError(res.message || 'Failed to load appointments.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Unable to connect to the hospital server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'ALL') return true;
    return apt.status === statusFilter;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await appointmentService.updateStatus(id, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
        setFeedbackMessage(`Appointment status updated to ${newStatus}.`);
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        throw new Error(res.message || 'Failed to update appointment status.');
      }
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Failed to update appointment status.';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSaveBooking = async (bookingData) => {
    try {
      const res = await appointmentService.bookAppointment({
        patientId: parseInt(bookingData.patientId, 10),
        doctorId: parseInt(bookingData.doctorId, 10),
        appointmentDate: bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        reason: bookingData.reason,
      });
      if (res.success) {
        await fetchAppointments();
        setIsModalOpen(false);
        setFeedbackMessage('New appointment booked successfully.');
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        throw new Error(res.message || 'Failed to book appointment.');
      }
    } catch (err) {
      const errorMsg = err.data?.message || err.message || 'Failed to book appointment.';
      throw new Error(errorMsg);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments Calendar & Schedule</h1>
          <p>Book visits, prevent conflicts, and manage patient consultation statuses.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Book New Visit
        </Button>
      </div>

      {feedbackMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          ✓ {feedbackMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          ✕ {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="card mb-6" style={{ marginBottom: '24px' }}>
        <div className="card-body flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Filter Status:</span>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-muted">
            Showing <strong>{filteredAppointments.length}</strong> appointments
          </div>
        </div>
      </div>

      {/* Appointments Data Table */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center text-muted" style={{ padding: '36px 0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏳</div>
            <p className="font-semibold">Loading appointments schedule...</p>
            <p className="text-xs text-muted">Retrieving hospital bookings from database</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Appointment ID</th>
                    <th>Patient</th>
                    <th>Doctor & Department</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center" style={{ padding: '32px' }}>
                        No appointments found matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const displayId = typeof apt.id === 'number'
                        ? `#APT-${apt.id.toString().padStart(4, '0')}`
                        : apt.id;
                      const displayDate = apt.date
                        ? (typeof apt.date === 'string' ? apt.date.split('T')[0] : new Date(apt.date).toISOString().split('T')[0])
                        : 'N/A';
                      const displayTime = apt.time || 'Scheduled';

                      return (
                        <tr key={apt.id}>
                          <td style={{ fontWeight: 600 }}>{displayId}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.patient?.name || 'Unknown Patient'}</div>
                            <div className="text-xs text-muted">{apt.patient?.mrn || 'N/A'}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{apt.doctor?.name || 'Consulting Physician'}</div>
                            <div className="text-xs text-muted">{apt.doctor?.department || apt.doctor?.specialization || 'Clinical'}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{displayDate}</div>
                            <div className="text-xs text-muted">{displayTime}</div>
                          </td>
                          <td>{apt.reason || 'General Consultation'}</td>
                          <td>
                            <Badge variant={statusVariantMap[apt.status] || 'neutral'}>
                              {(apt.status || 'Scheduled').toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              {apt.status === 'Scheduled' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                                >
                                  Confirm
                                </Button>
                              )}
                              {apt.status === 'Confirmed' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleStatusChange(apt.id, 'Completed')}
                                >
                                  Complete
                                </Button>
                              )}
                              {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  style={{ color: 'var(--color-danger)' }}
                                  onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
