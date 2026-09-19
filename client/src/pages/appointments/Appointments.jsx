// client/src/pages/appointments/Appointments.jsx
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function Appointments() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Appointments Calendar & Schedule</h1>
          <p>Book, reschedule, or cancel patient consultations.</p>
        </div>
        <Button variant="primary">+ Book Appointment</Button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Full Calendar Module Coming in Phase 8</h3>
            <p>You will be able to manage time slots, prevent double-booking, and filter by doctor/department.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
