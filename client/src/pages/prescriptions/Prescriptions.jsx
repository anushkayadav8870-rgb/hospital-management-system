// =============================================
// client/src/pages/prescriptions/Prescriptions.jsx
// Prescription Orders & History Directory View
// =============================================

import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PrescriptionModal from '../../components/prescriptions/PrescriptionModal';
import { prescriptionService } from '../../services/prescriptionService';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await prescriptionService.getPrescriptions();
      if (res.success && Array.isArray(res.data)) {
        setPrescriptions(res.data);
      } else {
        setError(res.message || 'Failed to load prescriptions.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Unable to connect to the hospital server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const patientName = rx.patient?.name || rx.patientName || '';
    const mrn = rx.patient?.mrn || rx.mrn || '';
    const doctorName = rx.doctor?.name || rx.doctorName || '';
    const term = searchTerm.toLowerCase();

    const matchesItems = Array.isArray(rx.items) && rx.items.some((i) =>
      (i.medicineName || '').toLowerCase().includes(term)
    );

    return (
      patientName.toLowerCase().includes(term) ||
      mrn.toLowerCase().includes(term) ||
      doctorName.toLowerCase().includes(term) ||
      matchesItems
    );
  });

  const handleSavePrescription = async (formData) => {
    try {
      const res = await prescriptionService.createPrescription(formData);
      if (res.success) {
        setFeedbackMessage('Prescription order issued successfully.');
        setIsModalOpen(false);
        await fetchPrescriptions();
      } else {
        throw new Error(res.message || 'Failed to create prescription.');
      }
    } catch (err) {
      throw new Error(err.data?.message || err.message || 'Failed to create prescription.');
    }
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

      {feedbackMessage && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          ✓ {feedbackMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
          ✕ {error}
        </div>
      )}

      {/* Search Toolbar */}
      <div className="card mb-6" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <input
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search by patient, MRN, doctor, or medicine name..."
            style={{ maxWidth: '420px' }}
          />
        </div>
      </div>

      {/* Prescription Cards List / States */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center text-muted" style={{ padding: '36px 0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏳</div>
            <p className="font-semibold">Loading prescription orders...</p>
            <p className="text-xs text-muted">Retrieving pharmacy records from database</p>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state" style={{ padding: '32px', textAlign: 'center' }}>
            <p className="text-muted">
              {searchTerm
                ? `No prescription orders found matching "${searchTerm}".`
                : 'No prescription orders registered yet in the system.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-5">
          {filteredPrescriptions.map((rx) => {
            const rxCode = `#RX-${rx.id.toString().padStart(4, '0')}`;
            const patientName = rx.patient?.name || rx.patientName || 'Unknown Patient';
            const mrn = rx.patient?.mrn || rx.mrn || 'N/A';
            const doctorName = rx.doctor?.name || rx.doctorName || 'Attending Physician';
            const specialization = rx.doctor?.specialization || rx.specialization || 'Clinical';
            const rxDate = rx.createdAt
              ? rx.createdAt.split('T')[0]
              : (rx.date || 'Recent');
            const items = Array.isArray(rx.items) ? rx.items : [];

            return (
              <div key={rx.id} className="card" style={{ marginBottom: '16px' }}>
                <div className="card-header">
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{rxCode}</span>
                    <span style={{ marginLeft: '12px', fontWeight: 600 }}>{patientName} ({mrn})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">{rxDate}</span>
                    <Badge variant="primary">{doctorName}{specialization ? ` (${specialization})` : ''}</Badge>
                  </div>
                </div>

                <div className="card-body">
                  {/* Medication Items List */}
                  <div className="mb-4">
                    <div className="text-xs text-muted uppercase font-bold mb-2">Prescribed Medications ({items.length})</div>
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
                          {items.map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td style={{ fontWeight: 700 }}>💊 {item.medicineName}</td>
                              <td><Badge variant="info">{item.dosage}</Badge></td>
                              <td>{item.frequency}</td>
                              <td>{item.duration || '7 days'}</td>
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
            );
          })}
        </div>
      )}

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePrescription}
      />
    </div>
  );
}
