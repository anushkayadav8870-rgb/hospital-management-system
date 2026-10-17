// =============================================
// client/src/pages/admin/DatabaseViewer.jsx
// Admin Database Explorer for Live PostgreSQL Verification
// =============================================

import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import Badge from '../../components/common/Badge';

export default function DatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const tableList = [
    { id: 'patients', label: 'patients' },
    { id: 'doctors', label: 'doctors' },
    { id: 'appointments', label: 'appointments' },
    { id: 'bills', label: 'bills' },
    { id: 'users', label: 'users' },
    { id: 'departments', label: 'departments' },
    { id: 'beds', label: 'beds' },
  ];

  const fetchTableData = async (tableName, search = '') => {
    setLoading(true);
    setError('');
    try {
      const query = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await apiRequest(`/analytics/db-viewer?table=${tableName}${query}`);
      setTableData(res);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to fetch database table records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable, searchTerm);
  }, [selectedTable]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTableData(selectedTable, searchTerm);
  };

  const isPrimaryKey = (colName) => colName.includes('(PK)');
  const isForeignKey = (colName) => colName.includes('(FK');

  return (
    <div style={{ padding: '24px' }}>
      {/* Top Header & DB Environment Information Banner */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-navy, #0f172a)' }}>
              🗄️ PostgreSQL Database Explorer
            </h1>
            <Badge variant="primary">ADMIN ONLY</Badge>
          </div>
          <p className="text-sm text-secondary" style={{ marginTop: '4px' }}>
            Direct inspection of live relational tables, primary keys, and foreign keys for database persistence verification.
          </p>
        </div>

        {/* Live DB Connection Details Card */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '0.8125rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <strong>Database:</strong> <code>{tableData?.meta?.database || 'neondb'}</code>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#0f766e', fontWeight: 600 }}>{tableData?.meta?.provider || 'Neon PostgreSQL'}</span>
          </div>
          {lastUpdated && (
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Last Queried: {lastUpdated} (Live Pool Connection)
            </div>
          )}
        </div>
      </div>

      {/* Table Selector Navigation Bar with Record Count Badges */}
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
        {tableList.map((t) => {
          const isSelected = selectedTable === t.id;
          const count = tableData?.meta?.tableCounts?.[t.id];

          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTable(t.id);
                setSearchTerm('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isSelected ? 'var(--color-primary, #0284c7)' : '#cbd5e1',
                backgroundColor: isSelected ? 'var(--color-primary, #0284c7)' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                fontWeight: isSelected ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <span>{t.label}</span>
              {count !== undefined && (
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#475569',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Table Details, Search Filter, and Refresh Control */}
      <div className="card">
        <div className="card-header flex justify-between items-center flex-wrap gap-3">
          <div className="card-title flex items-center gap-2" style={{ fontSize: '1rem' }}>
            <span>Table:</span>
            <code style={{ color: 'var(--color-primary, #0284c7)', fontSize: '1.05rem', fontWeight: 700 }}>
              {selectedTable}
            </code>
            {tableData && (
              <span className="text-sm font-normal text-secondary ml-2">
                (Showing {tableData.rowCount} of {tableData.totalRecords} records)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                className="form-input"
                style={{ width: '220px', padding: '6px 10px', fontSize: '0.85rem' }}
                placeholder={`Search ${selectedTable}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Filter
              </button>
            </form>

            <button
              onClick={() => fetchTableData(selectedTable, searchTerm)}
              style={{
                padding: '6px 12px',
                fontSize: '0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Query fresh records from PostgreSQL"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {error && (
            <div className="alert alert-danger" style={{ margin: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              Executing SQL query on Neon PostgreSQL database...
            </div>
          ) : !tableData || !tableData.data || tableData.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
              <div>No records found in table <code>{selectedTable}</code> {searchTerm ? `matching "${searchTerm}"` : ''}.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                    {tableData.columns.map((col) => {
                      const isPk = isPrimaryKey(col);
                      const isFk = isForeignKey(col);

                      return (
                        <th
                          key={col}
                          style={{
                            padding: '12px 14px',
                            borderBottom: '2px solid #e2e8f0',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            color: isPk ? '#0369a1' : isFk ? '#4338ca' : '#475569',
                            whiteSpace: 'nowrap',
                            backgroundColor: isPk ? '#f0f9ff' : isFk ? '#eef2ff' : undefined,
                          }}
                        >
                          {col}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {tableData.data.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      {tableData.columns.map((col) => {
                        const isPk = isPrimaryKey(col);
                        const isFk = isForeignKey(col);
                        const val = row[col];

                        return (
                          <td
                            key={col}
                            style={{
                              padding: '10px 14px',
                              fontSize: '0.85rem',
                              color: '#1e293b',
                              whiteSpace: 'nowrap',
                              fontWeight: isPk ? 700 : isFk ? 600 : 400,
                              backgroundColor: isPk ? 'rgba(240, 249, 255, 0.4)' : undefined,
                            }}
                          >
                            {val !== null && val !== undefined ? (
                              isPk ? (
                                <code style={{ color: '#0369a1', fontWeight: 700 }}>#{val}</code>
                              ) : (
                                String(val)
                              )
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                            )}
                          </td>
                        );
                      })}
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

