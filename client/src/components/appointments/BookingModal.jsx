// =============================================
// client/src/components/appointments/BookingModal.jsx
// Modal Form for Booking New Patient Appointments
// =============================================

import { useState } from 'react';
import Button from '../common/Button';

export default function BookingModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    patientId: '1',
    doctorId: '1',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:30',
    reason: 'Routine Health Consultation',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      setError('Please fill in all required fields.');
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
          {error && <div className="alert alert-danger mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="form-label">Select Patient *</label>
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
              <label className="form-label">Select Consulting Doctor *</label>
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
              <Button type="submit" variant="primary">
                Confirm Booking
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
