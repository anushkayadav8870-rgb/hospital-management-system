// =============================================
// client/src/pages/billing/Billing.jsx
// Financial Invoicing & Payment Ledger View
// =============================================

import { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import PaymentModal from '../../components/billing/PaymentModal';

const initialBills = [
  {
    id: 1,
    invoiceNumber: 'INV-9001',
    patient: { name: 'Eleanor Vance', mrn: 'PAT-2026-001' },
    totalAmount: 145.00,
    paidAmount: 145.00,
    dueAmount: 0.00,
    status: 'Paid',
    createdAt: '2026-09-15',
    items: [
      { id: 1, description: 'Cardiology Consultation Fee', amount: 120.00 },
      { id: 2, description: 'ECG Screening Procedure', amount: 25.00 },
    ],
    payments: [
      { id: 1, amountPaid: 145.00, paymentMethod: 'Credit Card', transactionRef: 'TXN-994821', paidAt: '2026-09-15' },
    ],
  },
  {
    id: 2,
    invoiceNumber: 'INV-9002',
    patient: { name: 'Marcus Brody', mrn: 'PAT-2026-002' },
    totalAmount: 90.00,
    paidAmount: 40.00,
    dueAmount: 50.00,
    status: 'Partially Paid',
    createdAt: '2026-09-12',
    items: [
      { id: 3, description: 'Pediatric Consultation Fee', amount: 90.00 },
    ],
    payments: [
      { id: 2, amountPaid: 40.00, paymentMethod: 'Cash', transactionRef: 'TXN-102938', paidAt: '2026-09-12' },
    ],
  },
  {
    id: 3,
    invoiceNumber: 'INV-9003',
    patient: { name: 'Clara Oswald', mrn: 'PAT-2026-003' },
    totalAmount: 150.00,
    paidAmount: 0.00,
    dueAmount: 150.00,
    status: 'Pending',
    createdAt: '2026-09-18',
    items: [
      { id: 4, description: 'Neurology Specialty Consultation', amount: 150.00 },
    ],
    payments: [],
  },
];

const statusVariantMap = {
  Paid: 'success',
  'Partially Paid': 'warning',
  Pending: 'danger',
};

export default function Billing() {
  const [bills, setBills] = useState(initialBills);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const filteredBills = bills.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  const totalRevenue = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalPending = bills.reduce((sum, b) => sum + b.dueAmount, 0);

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (paymentData) => {
    setBills(
      bills.map((b) => {
        if (b.id === paymentData.billId) {
          const newPaidAmount = b.paidAmount + paymentData.amountPaid;
          const newDueAmount = Math.max(0, b.totalAmount - newPaidAmount);
          let newStatus = 'Pending';
          if (newPaidAmount >= b.totalAmount) {
            newStatus = 'Paid';
          } else if (newPaidAmount > 0) {
            newStatus = 'Partially Paid';
          }

          const newPaymentRecord = {
            id: Date.now(),
            amountPaid: paymentData.amountPaid,
            paymentMethod: paymentData.paymentMethod,
            transactionRef: paymentData.transactionRef,
            paidAt: new Date().toISOString().split('T')[0],
          };

          return {
            ...b,
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: newStatus,
            payments: [...b.payments, newPaymentRecord],
          };
        }
        return b;
      })
    );

    setIsPaymentModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Billing & Financial Ledgers</h1>
          <p>Generate hospital invoices, track consultation fees, and record payments.</p>
        </div>
      </div>

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

      {/* Invoices List */}
      <div className="flex-col gap-5">
        {filteredBills.map((bill) => (
          <div key={bill.id} className="card">
            <div className="card-header">
              <div>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{bill.invoiceNumber}</span>
                <span style={{ marginLeft: '12px', fontWeight: 600 }}>{bill.patient.name} ({bill.patient.mrn})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{bill.createdAt}</span>
                <Badge variant={statusVariantMap[bill.status] || 'neutral'}>
                  {bill.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="card-body">
              {/* Line Items Breakdown */}
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
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Action */}
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-muted block">Total Bill:</span>
                    <span className="font-bold text-base">${bill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block">Paid:</span>
                    <span className="font-bold text-base" style={{ color: 'var(--color-success)' }}>${bill.paidAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted block">Remaining Due:</span>
                    <span className="font-bold text-base" style={{ color: bill.dueAmount > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                      ${bill.dueAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {bill.dueAmount > 0 && (
                  <Button variant="primary" size="sm" onClick={() => handleOpenPayment(bill)}>
                    💳 Record Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleRecordPayment}
        bill={selectedBill}
      />
    </div>
  );
}
