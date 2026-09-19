// =============================================
// client/src/pages/dashboard/Dashboard.jsx
//
// CONCEPT: Combining Components, Props, and State
// =============================================
// The Dashboard is the main hub of the application.
// It brings together:
//   1. StatCard (for metric summaries)
//   2. Badge (for status indicators)
//   3. Button (for quick actions)
//   4. Sample arrays rendered using .map()
// =============================================

import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

// Sample fictional data for demonstration
const recentAppointments = [
  { id: 'APT-1001', patient: 'Eleanor Vance', doctor: 'Dr. Sarah Jenkins', time: '09:30 AM', department: 'Cardiology', status: 'completed' },
  { id: 'APT-1002', patient: 'Marcus Brody', doctor: 'Dr. Robert Chen', time: '10:15 AM', department: 'Pediatrics', status: 'confirmed' },
  { id: 'APT-1003', patient: 'Clara Oswald', doctor: 'Dr. Emily Watson', time: '11:00 AM', department: 'Neurology', status: 'scheduled' },
  { id: 'APT-1004', patient: 'Arthur Pendelton', doctor: 'Dr. Sarah Jenkins', time: '01:30 PM', department: 'Cardiology', status: 'cancelled' },
  { id: 'APT-1005', patient: 'Sophia Loren', doctor: 'Dr. James Wilson', time: '02:45 PM', department: 'Orthopedics', status: 'confirmed' },
];

const statusVariantMap = {
  completed: 'success',
  confirmed: 'primary',
  scheduled: 'warning',
  cancelled: 'danger',
};

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* Page Welcome Header */}
      <div className="page-header">
        <div>
          <h1>Hospital Overview</h1>
          <p>Welcome back! Here is what is happening at PulseCare Hospital today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">📥 Export Report</Button>
          <Button variant="primary">+ Book Appointment</Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          iconColor="blue"
          value="1,284"
          label="Total Patients Registered"
          change="12 added this week"
          changeType="up"
        />
        <StatCard
          icon="👨‍⚕️"
          iconColor="green"
          value="48"
          label="Active Doctors"
          change="All departments staffed"
          changeType="up"
        />
        <StatCard
          icon="📅"
          iconColor="amber"
          value="34"
          label="Appointments Today"
          change="8 remaining"
          changeType="up"
        />
        <StatCard
          icon="💳"
          iconColor="purple"
          value="$14,250"
          label="Today's Revenue"
          change="+8% vs yesterday"
          changeType="up"
        />
      </div>

      {/* Main Grid Section */}
      <div className="dashboard-grid">
        {/* Left Column: Today's Appointments Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Appointments</div>
            <Button variant="ghost" size="sm">View All →</Button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td style={{ fontWeight: 600 }}>{apt.id}</td>
                      <td>{apt.patient}</td>
                      <td>{apt.doctor}</td>
                      <td>{apt.time}</td>
                      <td>{apt.department}</td>
                      <td>
                        <Badge variant={statusVariantMap[apt.status] || 'neutral'}>
                          {apt.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats & Hospital Notices */}
        <div className="flex-col gap-5">
          {/* Quick Department Occupancy Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Department Occupancy</div>
            </div>
            <div className="card-body">
              <div className="flex-col gap-4">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Cardiology</span>
                    <span>85%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--color-primary)' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Pediatrics</span>
                    <span>60%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: 'var(--color-success)' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Emergency / ICU</span>
                    <span>92%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '92%', height: '100%', background: 'var(--color-danger)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Announcement Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📢 Hospital Notice</div>
            </div>
            <div className="card-body">
              <p className="text-sm text-muted">
                Routine server maintenance scheduled for Sunday at 02:00 AM EST. All offline records will auto-sync upon reconnection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
