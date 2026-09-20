// =============================================
// client/src/pages/doctors/Doctors.jsx
// Doctor Directory & Staff Management View
// =============================================

import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import DoctorModal from '../../components/doctors/DoctorModal';
import { doctorService } from '../../services/doctorService';

const initialSampleDoctors = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'dr.jenkins@pulsecare.com',
    phone: '+1 555-0101',
    specialization: 'Cardiovascular Disease',
    qualification: 'MD, FACC',
    consultationFee: 120.00,
    department: { id: 1, name: 'Cardiology', locationFloor: 'Floor 3 - Wing A' },
    status: 'Available',
    isActive: true,
  },
  {
    id: 2,
    name: 'Dr. Robert Chen',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'dr.chen@pulsecare.com',
    phone: '+1 555-0102',
    specialization: 'Pediatric Emergency',
    qualification: 'MD, FAAP',
    consultationFee: 90.00,
    department: { id: 2, name: 'Pediatrics', locationFloor: 'Floor 2 - Wing B' },
    status: 'In Consultation',
    isActive: true,
  },
  {
    id: 3,
    name: 'Dr. Emily Watson',
    firstName: 'Emily',
    lastName: 'Watson',
    email: 'dr.watson@pulsecare.com',
    phone: '+1 555-0103',
    specialization: 'Neurology & Brain Health',
    qualification: 'MD, PhD',
    consultationFee: 150.00,
    department: { id: 3, name: 'Neurology', locationFloor: 'Floor 4 - Wing C' },
    status: 'On Leave',
    isActive: true,
  },
];

export default function Doctors() {
  const [doctors, setDoctors] = useState(() => {
    const cached = localStorage.getItem('hms_doctors_cache');
    return cached ? JSON.parse(cached) : initialSampleDoctors;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getDoctors();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDoctors(res.data);
        localStorage.setItem('hms_doctors_cache', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('API fetch warning, retaining local cache:', err.message);
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

  const handleSaveDoctor = async (formData) => {
    if (selectedDoctor) {
      try {
        const res = await doctorService.updateDoctor(selectedDoctor.id, formData);
        if (res.success) {
          await fetchDoctors();
        }
      } catch (err) {
        console.warn('Update via API failed, updating local state:', err.message);
        const updatedList = doctors.map((d) =>
          d.id === selectedDoctor.id
            ? {
                ...d,
                name: `Dr. ${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                specialization: formData.specialization,
                qualification: formData.qualification,
                consultationFee: parseFloat(formData.consultationFee),
              }
            : d
        );
        setDoctors(updatedList);
        localStorage.setItem('hms_doctors_cache', JSON.stringify(updatedList));
      }
    } else {
      const deptNames = { '1': 'Cardiology', '2': 'Pediatrics', '3': 'Neurology', '4': 'Orthopedics' };
      try {
        const res = await doctorService.createDoctor(formData);
        if (res.success) {
          await fetchDoctors();
        }
      } catch (err) {
        console.warn('Create via API failed, saving to local persistent cache:', err.message);
        const newDoc = {
          id: Date.now(),
          name: `Dr. ${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          qualification: formData.qualification,
          consultationFee: parseFloat(formData.consultationFee),
          department: {
            id: parseInt(formData.departmentId, 10),
            name: deptNames[formData.departmentId] || 'Cardiology',
            locationFloor: 'Floor 3',
          },
          status: 'Available',
          isActive: true,
        };
        const updatedList = [newDoc, ...doctors];
        setDoctors(updatedList);
        localStorage.setItem('hms_doctors_cache', JSON.stringify(updatedList));
      }
    }

    setIsModalOpen(false);
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

                <div className="flex justify-between items-center mt-4">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(doc)}>
                    ✏️ Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    📅 Schedule
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
    </div>
  );
}
