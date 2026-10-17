// =============================================
// client/src/pages/emr/MedicalRecords.jsx
// Electronic Medical Records (EMR) Directory View
// =============================================

import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import RecordModal from '../../components/emr/RecordModal';
import { recordService } from '../../services/recordService';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recordService.getMedicalRecords();
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setError(res.message || 'Failed to load medical records.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Unable to connect to the hospital server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((r) => {
    const patientName = r.patient?.name || r.patientName || '';
    const mrn = r.patient?.mrn || r.mrn || '';
    const diagnosis = r.diagnosis || '';
    const doctorName = r.doctor?.name || r.doctorName || '';
    const term = searchTerm.toLowerCase();

    return (
      patientName.toLowerCase().includes(term) ||
      mrn.toLowerCase().includes(term) ||
      diagnosis.toLowerCase().includes(term) ||
      doctorName.toLowerCase().includes(term)
    );
  });

  const handleSaveRecord = async (recordData) => {
    try {
      const res = await recordService.createMedicalRecord(recordData);
      if (res.success) {
        setFeedbackMessage('Clinical medical record created successfully.');
        setIsModalOpen(false);
        await fetchRecords();
      } else {
        throw new Error(res.message || 'Failed to create medical record.');
      }
    } catch (err) {
      throw new Error(err.data?.message || err.message || 'Failed to create medical record.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Electronic Medical Records (EMR)</h1>
          <p>Clinical histories, diagnoses, treatment plans, and doctor examination notes.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Clinical Record
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
            placeholder="🔍 Search records by patient, MRN, diagnosis, or doctor..."
            style={{ maxWidth: '420px' }}
          />
        </div>
      </div>

      {/* EMR Content: Loading / Empty / List */}
      {loading ? (
        <div className="card">
          <div className="card-body text-center text-muted" style={{ padding: '36px 0' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏳</div>
            <p className="font-semibold">Loading medical records...</p>
            <p className="text-xs text-muted">Retrieving clinical histories from database</p>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state" style={{ padding: '32px', textAlign: 'center' }}>
            <p className="text-muted">
              {searchTerm
                ? `No medical records found matching "${searchTerm}".`
                : 'No clinical medical records registered yet in the system.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-5">
          {filteredRecords.map((rec) => {
            const patientName = rec.patient?.name || rec.patientName || 'Unknown Patient';
            const mrn = rec.patient?.mrn || rec.mrn || 'N/A';
            const doctorName = rec.doctor?.name || rec.doctorName || 'Attending Physician';
            const specialization = rec.doctor?.specialization || rec.specialization || 'Clinical';
            const recordDate = rec.createdAt
              ? rec.createdAt.split('T')[0]
              : (rec.date || 'Recent');

            return (
              <div key={rec.id} className="card" style={{ marginBottom: '16px' }}>
                <div className="card-header">
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                      {patientName}
                    </span>
                    <span className="text-sm text-muted" style={{ marginLeft: '12px' }}>
                      MRN: {mrn}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="info">{recordDate}</Badge>
                    <span className="text-sm font-semibold">
                      {doctorName} ({specialization})
                    </span>
                  </div>
                </div>

                <div className="card-body flex-col gap-4">
                  <div>
                    <div className="text-xs text-muted uppercase font-bold mb-1">Primary Diagnosis</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                      {rec.diagnosis}
                    </div>
                  </div>

                  <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs text-muted uppercase font-bold mb-1">Symptoms Reported</div>
                      <div className="text-sm">{rec.symptoms}</div>
                    </div>

                    <div style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      <div className="text-xs text-muted uppercase font-bold mb-1">Treatment Plan</div>
                      <div className="text-sm">{rec.treatmentPlan || 'None specified.'}</div>
                    </div>
                  </div>

                  {rec.doctorNotes && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                      <span className="text-xs text-muted uppercase font-bold">Doctor Examination Notes: </span>
                      <span className="text-sm text-muted">{rec.doctorNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Creation Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
      />
    </div>
  );
}
