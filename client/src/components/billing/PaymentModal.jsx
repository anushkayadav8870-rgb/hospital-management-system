// =============================================
// client/src/components/billing/PaymentModal.jsx
// Modal Form for Recording Invoice Payments
// =============================================

import { useState } from 'react';
import Button from '../common/Button';

export default function PaymentModal({ isOpen, onClose, onSave, bill = null }) {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [transactionRef, setTransactionRef] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !bill) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amountPaid);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    if (parsedAmount > bill.dueAmount) {
      setError(`Payment amount ($${parsedAmount}) cannot exceed remaining balance ($${bill.dueAmount.toFixed(2)}).`);
      return;
    }

    onSave({
      billId: bill.id,
      amountPaid: parsedAmount,
      paymentMethod,
      transactionRef: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '480px' }}
      >
        <div className="card-header">
          <div className="card-title">💳 Process Invoice Payment</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div className="card-body">
          <div className="mb-4" style={{ background: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Invoice #:</span>
              <span className="font-bold">{bill.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted">Patient:</span>
              <span className="font-bold">{bill.patient.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Remaining Balance Due:</span>
              <span className="font-bold" style={{ color: 'var(--color-danger)' }}>
                ${bill.dueAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {error && <div className="alert alert-danger mb-4">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="form-label">Payment Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={`Max $${bill.dueAmount.toFixed(2)}`}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Insurance Claim">Insurance Claim</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Transaction / Reference Number</label>
              <input
                type="text"
                className="form-input"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Optional (e.g. TXN-994821)"
              />
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
