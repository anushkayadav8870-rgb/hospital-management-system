// =============================================
// client/src/pages/billing/Billing.jsx
// Financial Invoicing & Payment Ledger View
// =============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PaymentModal from '../../components/billing/PaymentModal';
import CreateBillModal from '../../components/billing/CreateBillModal';
import { billingService } from '../../services/billingService';

const statusVariantMap = {
  Paid: 'success',
  'Partially Paid': 'warning',
  Pending: 'danger',
};

export default function Billing() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const canCreateInvoice = !user || user.role === 'ADMIN' || user.role === 'RECEPTIONIST';

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await billingService.getBills(statusFilter !== 'ALL' ? statusFilter : '');
      if (res.success && Array.isArray(res.data)) {
        setBills(res.data);
      } else {
        setError(res.message || 'Failed to load hospital invoices.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Unable to connect to the hospital billing server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const filteredBills = bills.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const totalRevenue = bills.reduce((sum, b) => sum + (parseFloat(b.paidAmount) || 0), 0);
  const totalPending = bills.reduce((sum, b) => sum + (parseFloat(b.dueAmount) || 0), 0);

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (paymentData) => {
    const res = await billingService.recordPayment(paymentData.billId, {
      amountPaid: paymentData.amountPaid,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
    });

    if (res.success) {
      setFeedbackMessage(res.message || 'Payment recorded successfully.');
      setTimeout(() => setFeedbackMessage(null), 3000);
      setIsPaymentModalOpen(false);
      await fetchBills();
    } else {
      throw new Error(res.message || 'Failed to record payment.');
    }
  };

  const handleCreateBill = async (billData) => {
    const res = await billingService.createBill(billData);
    if (res.success) {
      setFeedbackMessage(res.message || 'Hospital invoice created successfully.');
      setTimeout(() => setFeedbackMessage(null), 4000);
      setIsCreateModalOpen(false);
      await fetchBills();
    } else {
      throw new Error(res.message || 'Failed to generate hospital invoice.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Billing & Financial Ledgers</h1>
          <p>Generate hospital invoices, track consultation fees, and record payments.</p>
        </div>
        {canCreateInvoice && (
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Create Invoice
          </Button>
        )}
      </div>

      {feedbackMessage && (
        <div className="alert alert-success mb-6">
          {feedbackMessage}
        </div>
      )}

      {error && (
        <div className="alert alert-danger flex justify-between items-center mb-6">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchBills}>
            Retry
          </Button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue Collected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">⏳</div>
          <div className="stat-info">
            <div className="stat-value">${totalPending.toFixed(2)}</div>
            <div className="stat-label">Pending Outstanding Balance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">🧾</div>
          <div className="stat-info">
            <div className="stat-value">{bills.length}</div>
            <div className="stat-label">Total Invoices Issued</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card mb-6" style={{ marginBottom: '24px' }}>
        <div className="card-body flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Filter Status:</span>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p className="text-muted">Loading hospital invoices...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBills.length === 0 && (
        <div className="card text-center" style={{ padding: '48px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧾</div>
          <h3 style={{ marginBottom: '8px' }}>No Invoices Found</h3>
          <p className="text-muted">
            {statusFilter === 'ALL'
              ? 'There are currently no billing records in the hospital system.'
              : `No invoices found matching status "${statusFilter}".`}
          </p>
        </div>
      )}

      {/* Invoices List */}
      {!loading && filteredBills.length > 0 && (
        <div className="flex-col gap-5">
          {filteredBills.map((bill) => {
            const displayDate = bill.createdAt
              ? (typeof bill.createdAt === 'string' ? bill.createdAt.split('T')[0] : new Date(bill.createdAt).toISOString().split('T')[0])
              : 'N/A';
            const totalAmt = parseFloat(bill.totalAmount) || 0;
            const paidAmt = parseFloat(bill.paidAmount) || 0;
            const dueAmt = parseFloat(bill.dueAmount) || 0;

            return (
              <div key={bill.id} className="card">
                <div className="card-header">
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{bill.invoiceNumber}</span>
                    <span style={{ marginLeft: '12px', fontWeight: 600 }}>
                      {bill.patient?.name || 'Unknown Patient'} {bill.patient?.mrn ? `(${bill.patient.mrn})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted">{displayDate}</span>
                    <Badge variant={statusVariantMap[bill.status] || 'neutral'}>
                      {(bill.status || 'PENDING').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="card-body">
                  {/* Line Items Breakdown */}
                  {Array.isArray(bill.items) && bill.items.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-muted uppercase font-bold mb-2">Line Item Breakdown</div>
                      <div className="table-wrapper">
                        <table className="table" style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bill.items.map((item) => (
                              <tr key={item.id}>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                  ${(parseFloat(item.amount) || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Totals & Action */}
                  <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <div className="flex gap-6">
                      <div>
                        <span className="text-xs text-muted block">Total Bill:</span>
                        <span className="font-bold text-base">${totalAmt.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted block">Paid:</span>
                        <span className="font-bold text-base" style={{ color: 'var(--color-success)' }}>
                          ${paidAmt.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted block">Remaining Due:</span>
                        <span
                          className="font-bold text-base"
                          style={{ color: dueAmt > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}
                        >
                          ${dueAmt.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {dueAmt > 0 && (
                      <Button variant="primary" size="sm" onClick={() => handleOpenPayment(bill)}>
                        💳 Record Payment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleRecordPayment}
        bill={selectedBill}
      />

      {/* Invoice Creation Modal */}
      <CreateBillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateBill}
      />
    </div>
  );
}
