// =============================================
// client/src/pages/patients/Patients.jsx
// Patient Directory Page View
// =============================================

import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PatientModal from '../../components/patients/PatientModal';
import { patientService } from '../../services/patientService';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    const fetchPatients = async () => {
      try {
        localStorage.removeItem('hms_patients_cache');
        const trimmed = searchTerm.trim();
        const res = await patientService.getPatients(trimmed);
        if (isCurrent && res.success && Array.isArray(res.data)) {
          setPatients(res.data);
        }
      } catch (err) {
        if (isCurrent) {
          console.warn('API fetch warning:', err.message);
        }
      }
    };

    fetchPatients();

    return () => {
      isCurrent = false;
    };
  }, [searchTerm]);

  const loadPatients = async () => {
    try {
      localStorage.removeItem('hms_patients_cache');
      const trimmed = searchTerm.trim();
      const res = await patientService.getPatients(trimmed);
      if (res.success && Array.isArray(res.data)) {
        setPatients(res.data);
      }
    } catch (err) {
      console.warn('API fetch warning:', err.message);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleSavePatient = async (formData) => {
    if (selectedPatient) {
      // Update existing patient
      try {
        const res = await patientService.updatePatient(selectedPatient.id, formData);
        if (res.success) {
          await loadPatients();
          setIsModalOpen(false);
        }
      } catch (err) {
        throw new Error(err.data?.message || err.message || 'Failed to update patient profile.');
      }
    } else {
      // Add new patient via API
      try {
        const res = await patientService.createPatient(formData);
        if (res.success) {
          await loadPatients();
          setIsModalOpen(false);
        }
      } catch (err) {
        throw new Error(err.data?.message || err.message || 'Failed to register patient.');
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await patientService.deactivatePatient(id);
      await loadPatients();
    } catch (err) {
      setPatients(
        patients.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patient Directory</h1>
          <p>Search, register, and manage patient health records.</p>
        </div>
        <Button variant="primary" onClick={handleOpenAddModal}>
          + Register New Patient
        </Button>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search patients by name, MRN, or phone..."
            style={{ maxWidth: '360px' }}
          />
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>MRN</th>
                  <th>Patient Name</th>
                  <th>Gender / DOB</th>
                  <th>Phone Number</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center" style={{ padding: '24px' }}>
                      No patient records found matching "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.mrn}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.gender} • {p.dob ? p.dob.split('T')[0] : 'N/A'}</td>
                      <td>{p.phone || 'N/A'}</td>
                      <td>
                        <Badge variant="info">{p.bloodGroup || 'A+'}</Badge>
                      </td>
                      <td>
                        <Badge variant={p.isActive ? 'success' : 'neutral'}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(p)}>
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(p.id)}
                            style={{ color: p.isActive ? 'var(--color-danger)' : 'var(--color-success)' }}
                          >
                            {p.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
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

      {/* Register / Edit Patient Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePatient}
        patient={selectedPatient}
      />
    </div>
  );
}

