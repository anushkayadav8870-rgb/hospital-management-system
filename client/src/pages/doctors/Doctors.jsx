// =============================================
// client/src/pages/doctors/Doctors.jsx
// Doctor Directory & Staff Management View
// =============================================

import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DoctorModal from '../../components/doctors/DoctorModal';
import DoctorScheduleModal from '../../components/doctors/DoctorScheduleModal';
import DeactivateDoctorModal from '../../components/doctors/DeactivateDoctorModal';
import { doctorService } from '../../services/doctorService';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [doctorToDeactivate, setDoctorToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);

  const fetchDoctors = async () => {
    try {
      localStorage.removeItem('hms_doctors_cache');
      const res = await doctorService.getDoctors();
      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.warn('API fetch warning:', err.message);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);


  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || doc.department?.name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleOpenScheduleModal = (doctor) => {
    setScheduleDoctor(doctor);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDeactivateModal = (doctor) => {
    setDoctorToDeactivate(doctor);
    setDeactivateError('');
    setIsDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    if (isDeactivating) return;
    setIsDeactivateModalOpen(false);
    setDoctorToDeactivate(null);
    setDeactivateError('');
  };

  const handleConfirmDeactivate = async () => {
    if (!doctorToDeactivate || isDeactivating) return;
    setIsDeactivating(true);
    setDeactivateError('');
    setFeedbackMessage(null);
    setFeedbackError(null);

    try {
      const res = await doctorService.deactivateDoctor(doctorToDeactivate.id);
      if (res.success) {
        setFeedbackMessage(
          `Dr. ${doctorToDeactivate.name || `${doctorToDeactivate.firstName} ${doctorToDeactivate.lastName}`} has been deactivated successfully. Historical appointments and records remain preserved.`
        );
        setIsDeactivateModalOpen(false);
        setDoctorToDeactivate(null);
        await fetchDoctors();
      } else {
        setDeactivateError(res.message || 'Failed to deactivate doctor account.');
      }
    } catch (err) {
      const rawMessage = err.data?.message || err.message;
      const normalizedMessage =
        rawMessage === 'Failed to fetch'
          ? 'Unable to connect to the hospital server. Please check your connection and try again.'
          : rawMessage || 'Failed to deactivate doctor account.';
      setDeactivateError(normalizedMessage);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleSaveDoctor = async (formData) => {
    if (selectedDoctor) {
      try {
        const res = await doctorService.updateDoctor(selectedDoctor.id, formData);
        if (res.success) {
          await fetchDoctors();
          setIsModalOpen(false);
        }
      } catch (err) {
        throw new Error(err.data?.message || err.message || 'Failed to update doctor profile.');
      }
    } else {
      try {
        const res = await doctorService.createDoctor(formData);
        if (res.success) {
          await fetchDoctors();
          setIsModalOpen(false);
        }
      } catch (err) {
        throw new Error(err.data?.message || err.message || 'Failed to register doctor.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Doctor Directory & Departments</h1>
          <p>Medical staff profiles, specializations, and availability schedules.</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          + Add New Doctor
        </Button>
      </div>

      {feedbackMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          ✓ {feedbackMessage}
        </div>
      )}
      {feedbackError && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          ✕ {feedbackError}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="card mb-6" style={{ marginBottom: '24px' }}>
        <div className="card-body flex gap-4 items-center justify-between">
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search doctor name or specialization..."
            style={{ maxWidth: '360px' }}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Department:</span>
            <select
              className="form-input"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {filteredDoctors.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No doctor records found matching criteria.</p>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div key={doc.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.3rem' }}>
                      👨‍⚕️
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{doc.name}</div>
                      <div className="text-sm text-muted">{doc.specialization}</div>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'Available' ? 'success' : doc.status === 'On Leave' ? 'danger' : 'warning'}>
                    {doc.status}
                  </Badge>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Qualification:</span>
                    <span style={{ fontWeight: 600 }}>{doc.qualification}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">Department:</span>
                    <span style={{ fontWeight: 600 }}>{doc.department?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Consultation Fee:</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      ${doc.consultationFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(doc)}>
                      ✏️ Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenScheduleModal(doc)}>
                      📅 Schedule
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeactivateModal(doc)}
                    style={{ color: 'var(--color-danger)' }}
                    title="Deactivate Doctor"
                  >
                    🚫 Deactivate
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDoctor}
        doctor={selectedDoctor}
      />

      {/* Doctor Schedule Modal */}
      <DoctorScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setScheduleDoctor(null);
        }}
        doctor={scheduleDoctor}
      />

      {/* Confirm Doctor Deactivation Modal */}
      <DeactivateDoctorModal
        isOpen={isDeactivateModalOpen}
        onClose={handleCloseDeactivateModal}
        onConfirm={handleConfirmDeactivate}
        doctor={doctorToDeactivate}
        isSubmitting={isDeactivating}
        error={deactivateError}
      />
    </div>
  );
}
