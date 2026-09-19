// client/src/pages/doctors/Doctors.jsx
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const sampleDoctors = [
  { id: 'DOC-101', name: 'Dr. Sarah Jenkins', dept: 'Cardiology', qualification: 'MD, FACC', status: 'Available' },
  { id: 'DOC-102', name: 'Dr. Robert Chen', dept: 'Pediatrics', qualification: 'MD, FAAP', status: 'In Consultation' },
  { id: 'DOC-103', name: 'Dr. Emily Watson', dept: 'Neurology', qualification: 'MD, PhD', status: 'On Leave' },
];

export default function Doctors() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Doctor Directory</h1>
          <p>Medical staff profiles, specializations, and availability schedules.</p>
        </div>
        <Button variant="primary">+ Add Doctor</Button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {sampleDoctors.map((doc) => (
          <div key={doc.id} className="card">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  👨‍⚕️
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{doc.name}</div>
                  <div className="text-sm text-muted">{doc.dept} • {doc.qualification}</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Badge variant={doc.status === 'Available' ? 'success' : doc.status === 'On Leave' ? 'danger' : 'warning'}>
                  {doc.status}
                </Badge>
                <Button variant="outline" size="sm">Schedule</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
