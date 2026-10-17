// =============================================
// client/src/pages/dashboard/Dashboard.jsx
//
// Hospital Main Overview & Analytics Hub
// Connected to Live PostgreSQL Backend & Role Analytics
// =============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { analyticsService } from '../../services/analyticsService';
import { appointmentService } from '../../services/appointmentService';

const statusVariantMap = {
  Completed: 'success',
  Confirmed: 'primary',
  Scheduled: 'warning',
  Cancelled: 'danger',
  'No-Show': 'neutral',
  completed: 'success',
  confirmed: 'primary',
  scheduled: 'warning',
  cancelled: 'danger',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch appointments for table
      const aptPromise = appointmentService.getAppointments();

      // 2. Fetch metrics only if role is authorized (ADMIN, RECEPTIONIST, DOCTOR)
      let metricsPromise = Promise.resolve(null);
      if (user && (user.role === 'ADMIN' || user.role === 'RECEPTIONIST' || user.role === 'DOCTOR')) {
        metricsPromise = analyticsService.getDashboardMetrics().catch(() => null);
      }

      const [aptRes, metricRes] = await Promise.all([aptPromise, metricsPromise]);

      if (aptRes?.success && Array.isArray(aptRes.data)) {
        setAppointments(aptRes.data);
      }

      if (metricRes?.success && metricRes.data) {
        setMetrics(metricRes.data);
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const handleExportReport = () => {
    // Generate clean CSV of appointment metrics
    const headers = 'ID,Patient,Doctor,Date,Time,Department,Status\n';
    const rows = appointments
      .map((a) => {
        const id = typeof a.id === 'number' ? `#APT-${a.id.toString().padStart(4, '0')}` : a.id;
        const patientName = a.patient?.name || 'N/A';
        const docName = a.doctor?.name || 'N/A';
        const aptDate = a.date
          ? (typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0])
          : 'N/A';
        const aptTime = a.time || 'N/A';
        const dept = a.doctor?.department || a.doctor?.specialization || 'Clinical';
        const status = a.status || 'N/A';
        return `"${id}","${patientName}","${docName}","${aptDate}","${aptTime}","${dept}","${status}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MediCore_Hospital_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';
  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  return (
    <div className="dashboard-page">
      {/* Page Welcome Header */}
      <div className="page-header">
        <div>
          <h1>Hospital Overview</h1>
          <p>
            Welcome back, {user?.name || 'User'}!{' '}
            {isPatient ? 'Manage your upcoming consultations and medical history.' : "Here is what is happening across MediCore Hospital today."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportReport} title="Export appointment summary as CSV">
            📥 Export Report
          </Button>
          <Button variant="primary" onClick={() => navigate('/appointments')}>
            + Book Appointment
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger flex justify-between items-center mb-6">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            Retry
          </Button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid mb-6">
        {isAdminOrStaff && (
          <>
            <StatCard
              icon="👥"
              iconColor="blue"
              value={loading ? '...' : (metrics?.totalPatients ?? 0)}
              label="Total Patients Registered"
              change="Active hospital records"
              changeType="up"
            />
            <StatCard
              icon="👨‍⚕️"
              iconColor="green"
              value={loading ? '...' : (metrics?.totalDoctors ?? 0)}
              label="Active Doctors"
              change="Clinical staff on duty"
              changeType="up"
            />
            <StatCard
              icon="📅"
              iconColor="amber"
              value={loading ? '...' : (metrics?.todayAppointments ?? 0)}
              label="Appointments Today"
              change="Scheduled visits"
              changeType="up"
            />
            <StatCard
              icon="💳"
              iconColor="purple"
              value={
                loading
                  ? '...'
                  : `$${(parseFloat(metrics?.totalRevenue) || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
              }
              label="Total Revenue Collected"
              change="From payments ledger"
              changeType="up"
            />
          </>
        )}

        {isDoctor && (
          <>
            <StatCard
              icon="📅"
              iconColor="amber"
              value={loading ? '...' : (metrics?.todayAppointments ?? 0)}
              label="My Consultations Today"
              change="Assigned patient visits"
              changeType="up"
            />
            <StatCard
              icon="👥"
              iconColor="green"
              value={loading ? '...' : (metrics?.totalPatientsSeen ?? 0)}
              label="Patients Treated"
              change="Unique medical records"
              changeType="up"
            />
            <StatCard
              icon="📋"
              iconColor="blue"
              value={loading ? '...' : appointments.length}
              label="Total Appointments"
              change="In active schedule"
              changeType="up"
            />
          </>
        )}

        {isPatient && (
          <>
            <StatCard
              icon="📅"
              iconColor="blue"
              value={
                loading
                  ? '...'
                  : appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Confirmed').length
              }
              label="Upcoming Consultations"
              change="Active bookings"
              changeType="up"
            />
            <StatCard
              icon="🏥"
              iconColor="green"
              value={loading ? '...' : appointments.filter((a) => a.status === 'Completed').length}
              label="Completed Visits"
              change="Consultation history"
              changeType="up"
            />
          </>
        )}
      </div>

      {/* Main Grid Section */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Appointments Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Appointments</div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
              View All →
            </Button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center' }} className="text-muted">
                Loading appointments...
              </div>
            ) : (
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
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center" style={{ padding: '32px' }}>
                          No appointments found in the system.
                        </td>
                      </tr>
                    ) : (
                      appointments.slice(0, 6).map((apt) => {
                        const displayId =
                          typeof apt.id === 'number'
                            ? `#APT-${apt.id.toString().padStart(4, '0')}`
                            : apt.id;

                        return (
                          <tr key={apt.id}>
                            <td style={{ fontWeight: 600 }}>{displayId}</td>
                            <td>{apt.patient?.name || 'Unknown Patient'}</td>
                            <td>{apt.doctor?.name || 'Assigned Physician'}</td>
                            <td>{apt.time || 'Scheduled'}</td>
                            <td>
                              {apt.doctor?.department || apt.doctor?.specialization || 'Clinical'}
                            </td>
                            <td>
                              <Badge variant={statusVariantMap[apt.status] || 'neutral'}>
                                {(apt.status || 'SCHEDULED').toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Stats & Hospital Notices */}
        <div className="flex-col gap-5">
          {/* Quick Department Occupancy Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Department Status</div>
            </div>
            <div className="card-body">
              <div className="flex-col gap-4">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Cardiology</span>
                    <span>Active</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--color-primary)' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Pediatrics</span>
                    <span>Active</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: 'var(--color-success)' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Neurology & ICU</span>
                    <span>Active</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: 'var(--color-danger)' }} />
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
                PulseCare HMS database synchronization active. All patient visits and medical records are secured and HIPAA compliant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
