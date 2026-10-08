// =============================================
// client/src/pages/admin/DatabaseViewer.jsx
// Read-Only PostgreSQL Database Viewer for Teacher Demo
// =============================================

import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import Badge from '../../components/common/Badge';

export default function DatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState('patients');
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tables = [
    { id: 'patients', label: '1. patients (Patient Records)' },
    { id: 'doctors', label: '2. doctors (Doctor Profiles)' },
    { id: 'appointments', label: '3. appointments (Schedules & Status)' },
    { id: 'bills', label: '4. bills (Invoices & Payments)' },
    { id: 'users', label: '5. users (System Accounts)' },
    { id: 'departments', label: '6. departments (Hospital Wings)' },
  ];

  const fetchTableData = async (tableName) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest(`/analytics/db-viewer?table=${tableName}`);
      setTableData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch database table records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable);
  }, [selectedTable]);

  return (
    <div style={{ padding: '24px' }}>
      {/* Page Title & Teacher Demo Notice */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary-dark, #0f172a)' }}>
            📊 Live Database Viewer
          </h1>
          <p className="text-sm text-secondary">
            Read-Only view of live PostgreSQL database tables for system workflow verification.
          </p>
        </div>
        <Badge variant="success">PostgreSQL Direct Query</Badge>
      </div>

      {/* Table Selector Tabs */}
      <div
        className="card mb-6"
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          flexWrap: 'wrap',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTable(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: selectedTable === t.id ? '#2563eb' : '#cbd5e1',
              backgroundColor: selectedTable === t.id ? '#2563eb' : '#ffffff',
              color: selectedTable === t.id ? '#ffffff' : '#334155',
              fontWeight: selectedTable === t.id ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Database Table Details & Record Count */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div className="card-title" style={{ fontSize: '1rem' }}>
            Table: <code style={{ color: '#2563eb' }}>{selectedTable}</code>
            {tableData && (
              <span className="text-sm font-normal text-secondary ml-3">
                ({tableData.rowCount} records returned)
              </span>
            )}
          </div>
          <button
            onClick={() => fetchTableData(selectedTable)}
            style={{
              padding: '4px 12px',
              fontSize: '0.8rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh Table
          </button>
        </div>

        <div className="card-body">
          {error && <div className="alert alert-danger mb-4">{error}</div>}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              Querying PostgreSQL database table...
            </div>
          ) : !tableData || !tableData.data || tableData.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
              No records found in table <code>{selectedTable}</code>.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                    {tableData.columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '10px 12px',
                          borderBottom: '2px solid #e2e8f0',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#475569',
                          textTransform: 'uppercase',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.data.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      {tableData.columns.map((col) => (
                        <td
                          key={col}
                          style={{
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row[col] !== null && row[col] !== undefined
                            ? String(row[col])
                            : <span style={{ color: '#94a3b8', italic: 'true' }}>NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
