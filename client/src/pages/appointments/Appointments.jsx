// =============================================
// client/src/pages/appointments/Appointments.jsx
// Appointment Scheduling & Status Transition View
// =============================================

import { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import BookingModal from '../../components/appointments/BookingModal';

const initialAppointments = [
  {
    id: 'APT-1001',
    date: new Date().toISOString().split('T')[0],
    time: '09:30 AM',
    patient: { name: 'Eleanor Vance', mrn: 'PAT-2026-001', phone: '+1 555-0192' },
    doctor: { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology', department: 'Cardiology' },
    status: 'Completed',
    reason: 'Routine annual cardiac checkup',
  },
  {
    id: 'APT-1002',
    date: new Date().toISOString().split('T')[0],
    time: '10:15 AM',
    patient: { name: 'Marcus Brody', mrn: 'PAT-2026-002', phone: '+1 555-0144' },
    doctor: { name: 'Dr. Robert Chen', specialization: 'Pediatric Emergency', department: 'Pediatrics' },
    status: 'Confirmed',
    reason: 'Childhood allergy review',
  },
  {
    id: 'APT-1003',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    patient: { name: 'Clara Oswald', mrn: 'PAT-2026-003', phone: '+1 555-0188' },
    doctor: { name: 'Dr. Emily Watson', specialization: 'Neurology', department: 'Neurology' },
    status: 'Scheduled',
    reason: 'Migraine consultation',
  },
  {
    id: 'APT-1004',
    date: new Date().toISOString().split('T')[0],
    time: '01:30 PM',
    patient: { name: 'Arthur Pendelton', mrn: 'PAT-2026-004', phone: '+1 555-0100' },
    doctor: { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology', department: 'Cardiology' },
    status: 'Cancelled',
    reason: 'Patient requested rescheduling',
  },
];

const statusVariantMap = {
  Completed: 'success',
  Confirmed: 'primary',
  Scheduled: 'warning',
  Cancelled: 'danger',
  'No-Show': 'neutral',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'ALL') return true;
    return apt.status === statusFilter;
  });

  const handleStatusChange = (id, newStatus) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const handleSaveBooking = (bookingData) => {
    const doctorNames = {
      1: { name: 'Dr. Sarah Jenkins', dept: 'Cardiology' },
      2: { name: 'Dr. Robert Chen', dept: 'Pediatrics' },
      3: { name: 'Dr. Emily Watson', dept: 'Neurology' },
    };

    const patientNames = {
      1: { name: 'Eleanor Vance', mrn: 'PAT-2026-001' },
      2: { name: 'Marcus Brody', mrn: 'PAT-2026-002' },
      3: { name: 'Clara Oswald', mrn: 'PAT-2026-003' },
    };

    const doc = doctorNames[bookingData.doctorId] || doctorNames[1];
    const pat = patientNames[bookingData.patientId] || patientNames[1];

    const newApt = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: bookingData.appointmentDate,
      time: `${bookingData.appointmentTime} AM`,
      patient: { name: pat.name, mrn: pat.mrn, phone: '+1 555-0199' },
      doctor: { name: doc.name, specialization: doc.dept, department: doc.dept },
      status: 'Scheduled',
      reason: bookingData.reason || 'General Consultation',
    };

    setAppointments([newApt, ...appointments]);
    setIsModalOpen(false);
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
                    <td colSpan="7" className="text-center" style={{ padding: '24px' }}>
                      No appointments found matching current filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td style={{ fontWeight: 600 }}>{apt.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.patient.name}</div>
                        <div className="text-xs text-muted">{apt.patient.mrn}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.doctor.name}</div>
                        <div className="text-xs text-muted">{apt.doctor.department}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{apt.date}</div>
                        <div className="text-xs text-muted">{apt.time}</div>
                      </td>
                      <td>{apt.reason}</td>
                      <td>
                        <Badge variant={statusVariantMap[apt.status] || 'neutral'}>
                          {apt.status.toUpperCase()}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
