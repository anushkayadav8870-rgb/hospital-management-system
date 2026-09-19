// =============================================
// client/src/pages/prescriptions/Prescriptions.jsx
// Prescription Orders & History Directory View
// =============================================

import { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PrescriptionModal from '../../components/prescriptions/PrescriptionModal';

const initialPrescriptions = [
  {
    id: 'RX-8801',
    date: '2026-09-15',
    patientName: 'Eleanor Vance',
    mrn: 'PAT-2026-001',
    doctorName: 'Dr. Sarah Jenkins',
    specialization: 'Cardiology',
    instructions: 'Take all medications with water every morning after breakfast.',
    items: [
      { id: 10, medicineName: 'Atenolol', dosage: '25mg', frequency: 'Once daily (Morning)', duration: '30 days' },
      { id: 11, medicineName: 'Multivitamin Complex', dosage: '1 Tablet', frequency: 'Once daily', duration: '60 days' },
    ],
  },
  {
    id: 'RX-8802',
    date: '2026-09-12',
    patientName: 'Marcus Brody',
    mrn: 'PAT-2026-002',
    doctorName: 'Dr. Robert Chen',
    specialization: 'Pediatrics',
    instructions: 'Use nasal spray before sleep.',
    items: [
      { id: 12, medicineName: 'Cetirizine Syrup', dosage: '5ml', frequency: 'Once daily at bedtime', duration: '14 days' },
    ],
  },
];

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPrescriptions = prescriptions.filter(
    (rx) =>
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.items.some((i) => i.medicineName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSavePrescription = (formData) => {
    const newRx = {
      id: `RX-${Math.floor(8000 + Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      patientName: formData.patientId === '1' ? 'Eleanor Vance' : formData.patientId === '2' ? 'Marcus Brody' : 'Clara Oswald',
      mrn: `PAT-2026-00${formData.patientId}`,
      doctorName: formData.doctorId === '1' ? 'Dr. Sarah Jenkins' : 'Dr. Robert Chen',
      specialization: formData.doctorId === '1' ? 'Cardiology' : 'Pediatrics',
      instructions: formData.instructions,
      items: formData.items,
    };

    setPrescriptions([newRx, ...prescriptions]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Prescription Orders</h1>
          <p>Medication orders, dosage schedules, and drug administration history.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Issue New Prescription
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="card mb-6" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search by patient, MRN, or medicine name..."
            style={{ maxWidth: '400px' }}
          />
        </div>
      </div>

      {/* Prescription Cards List */}
      <div className="flex-col gap-5">
        {filteredPrescriptions.length === 0 ? (
          <div className="card">
            <div className="card-body empty-state">
              <p>No prescription orders found matching "{searchTerm}".</p>
            </div>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div key={rx.id} className="card">
              <div className="card-header">
                <div>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{rx.id}</span>
                  <span style={{ marginLeft: '12px', fontWeight: 600 }}>{rx.patientName} ({rx.mrn})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">{rx.date}</span>
                  <Badge variant="primary">{rx.doctorName}</Badge>
                </div>
              </div>

              <div className="card-body">
                {/* Medication Items List */}
                <div className="mb-4">
                  <div className="text-xs text-muted uppercase font-bold mb-2">Prescribed Medications</div>
                  <div className="table-wrapper">
                    <table className="table" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                      <thead>
                        <tr>
                          <th>Medicine Name</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rx.items.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700 }}>💊 {item.medicineName}</td>
                            <td><Badge variant="info">{item.dosage}</Badge></td>
                            <td>{item.frequency}</td>
                            <td>{item.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {rx.instructions && (
                  <div className="text-sm" style={{ background: 'var(--color-info-light)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-bold">Instructions: </span>
                    <span>{rx.instructions}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePrescription}
      />
    </div>
  );
}
