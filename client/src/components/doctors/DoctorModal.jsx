// =============================================
// client/src/components/doctors/DoctorModal.jsx
// Modal Dialog Form for Doctor Profile Creation / Editing
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';

export default function DoctorModal({ isOpen, onClose, onSave, doctor = null }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    consultationFee: 100,
    departmentId: '1',
    bio: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (doctor) {
      setFormData({
        firstName: doctor.firstName || '',
        lastName: doctor.lastName || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        consultationFee: doctor.consultationFee || 100,
        departmentId: doctor.department?.id || '1',
        bio: doctor.bio || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        consultationFee: 100,
        departmentId: '1',
        bio: '',
      });
    }
  }, [doctor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.specialization || !formData.qualification) {
      setError('Please fill in required fields (First Name, Last Name, Specialization, Qualification).');
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
        style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="card-header">
          <div className="card-title">{doctor ? 'Edit Doctor Profile' : 'Add New Doctor'}</div>
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
            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Sarah"
                  required
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Jenkins"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dr.jenkins@pulsecare.com"
                  required
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0101"
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Specialization *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Cardiovascular Disease"
                  required
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Qualification *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MD, FACC"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Department *</label>
                <select
                  className="form-input"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="1">Cardiology (Floor 3)</option>
                  <option value="2">Pediatrics (Floor 2)</option>
                  <option value="3">Neurology (Floor 4)</option>
                  <option value="4">Orthopedics (Floor 1)</option>
                </select>
              </div>
              <div className="form-group w-full">
                <label className="form-label">Consultation Fee ($) *</label>
                <input
                  type="number"
                  step="5"
                  className="form-input"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Doctor Bio & Notes</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Short bio or clinical experience..."
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {doctor ? 'Update Profile' : 'Add Doctor'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
