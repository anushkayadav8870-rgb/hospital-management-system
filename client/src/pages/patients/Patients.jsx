// client/src/pages/patients/Patients.jsx
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const samplePatients = [
  { id: 'PAT-001', name: 'Eleanor Vance', age: 34, gender: 'Female', phone: '+1 555-0192', blood: 'A+', status: 'Active' },
  { id: 'PAT-002', name: 'Marcus Brody', age: 52, gender: 'Male', phone: '+1 555-0144', blood: 'O+', status: 'Active' },
  { id: 'PAT-003', name: 'Clara Oswald', age: 29, gender: 'Female', phone: '+1 555-0188', blood: 'B-', status: 'Inactive' },
];

export default function Patients() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patient Directory</h1>
          <p>Search, register, and manage patient records.</p>
        </div>
        <Button variant="primary">+ Add New Patient</Button>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search patients by name, ID, or phone..."
            style={{ maxWidth: '360px' }}
          />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>MRN / ID</th>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Phone Number</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {samplePatients.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.age} yrs / {p.gender}</td>
                    <td>{p.phone}</td>
                    <td><Badge variant="info">{p.blood}</Badge></td>
                    <td><Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>{p.status}</Badge></td>
                    <td>
                      <Button variant="ghost" size="sm">View EMR</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
