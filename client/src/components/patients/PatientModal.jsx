// =============================================
// client/src/components/patients/PatientModal.jsx
// Modal Dialog Form for Patient Creation / Editing
// =============================================

import { useState, useEffect } from 'react';
import Button from '../common/Button';

export default function PatientModal({ isOpen, onClose, onSave, patient = null }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Female',
    bloodGroup: 'A+',
    emergencyContact: '',
    address: '',
  });

  const [error, setError] = useState('');

  // Populate form if editing existing patient
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dob: patient.dob ? patient.dob.split('T')[0] : '',
        gender: patient.gender || 'Female',
        bloodGroup: patient.bloodGroup || 'A+',
        emergencyContact: patient.emergencyContact || '',
        address: patient.address || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'Female',
        bloodGroup: 'A+',
        emergencyContact: '',
        address: '',
      });
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.dob) {
      setError('Please fill in required fields (First Name, Last Name, Date of Birth).');
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
          <div className="card-title">{patient ? 'Edit Patient Profile' : 'Register New Patient'}</div>
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
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@email.com"
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0199"
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Gender *</label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group w-full">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-input"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Emergency Contact Name & Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="e.g. John Doe (+1 555-0999)"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-input"
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full street address..."
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {patient ? 'Update Patient' : 'Register Patient'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
