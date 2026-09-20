// =============================================
// server/src/controllers/billingController.js
// Billing & Payment Ledger Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get all hospital bills with line items & payment status
// @route   GET /api/bills
// @access  Private (ADMIN, RECEPTIONIST, PATIENT)
exports.getBills = asyncHandler(async (req, res) => {
  const { status, patientId } = req.query;

  let queryText = `
    SELECT b.id, b.total_amount, b.paid_amount, b.status, b.created_at,
           p.id AS patient_id, p.mrn, pu.first_name AS patient_first_name, pu.last_name AS patient_last_name, pu.phone AS patient_phone
    FROM bills b
    JOIN patients p ON b.patient_id = p.id
    LEFT JOIN users pu ON p.user_id = pu.id
    WHERE 1=1
  `;

  const queryParams = [];

  if (req.user.role === 'PATIENT') {
    queryParams.push(req.user.id);
    queryText += ` AND p.user_id = $${queryParams.length}`;
  } else if (patientId) {
    queryParams.push(parseInt(patientId, 10));
    queryText += ` AND b.patient_id = $${queryParams.length}`;
  }

  if (status) {
    queryParams.push(status);
    queryText += ` AND b.status = $${queryParams.length}`;
  }

  queryText += ` ORDER BY b.created_at DESC`;

  const result = await db.query(queryText, queryParams);
  const bills = result.rows;

  // Fetch line items for each bill
  for (const bill of bills) {
    const itemsResult = await db.query(
      `SELECT id, description, amount FROM bill_items WHERE bill_id = $1`,
      [bill.id]
    );
    bill.items = itemsResult.rows.map((i) => ({
      id: i.id,
      description: i.description,
      amount: parseFloat(i.amount),
    }));

    const paymentsResult = await db.query(
      `SELECT id, amount_paid, payment_method, transaction_ref, paid_at FROM payments WHERE bill_id = $1`,
      [bill.id]
    );
    bill.payments = paymentsResult.rows.map((pm) => ({
      id: pm.id,
      amountPaid: parseFloat(pm.amount_paid),
      paymentMethod: pm.payment_method,
      transactionRef: pm.transaction_ref,
      paidAt: pm.paid_at,
    }));
  }

  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills.map((row) => ({
      id: row.id,
      invoiceNumber: `INV-${9000 + row.id}`,
      totalAmount: parseFloat(row.total_amount),
      paidAmount: parseFloat(row.paid_amount),
      dueAmount: parseFloat(row.total_amount) - parseFloat(row.paid_amount),
      status: row.status,
      createdAt: row.created_at,
      patient: {
        id: row.patient_id,
        mrn: row.mrn,
        name: `${row.patient_first_name} ${row.patient_last_name}`,
        phone: row.patient_phone,
      },
      items: row.items,
      payments: row.payments,
    })),
  });
});

// @desc    Generate a new hospital bill with line items
// @route   POST /api/bills
// @access  Private (ADMIN, RECEPTIONIST)
exports.createBill = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, items } = req.body;

  if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Please provide patientId and at least one bill line item.');
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Calculate total bill amount
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    // 2. Insert master bill
    const billResult = await client.query(
      `INSERT INTO bills (patient_id, appointment_id, total_amount, paid_amount, status)
       VALUES ($1, $2, $3, 0.00, 'Pending')
       RETURNING id, created_at`,
      [patientId, appointmentId || null, totalAmount]
    );

    const billId = billResult.rows[0].id;

    // 3. Insert line items
    for (const item of items) {
      if (!item.description || item.amount === undefined) {
        throw new Error('Each line item must specify description and amount.');
      }

      await client.query(
        `INSERT INTO bill_items (bill_id, description, amount)
         VALUES ($1, $2, $3)`,
        [billId, item.description, parseFloat(item.amount)]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully.',
      data: {
        id: billId,
        invoiceNumber: `INV-${9000 + billId}`,
        totalAmount,
        status: 'Pending',
        createdAt: billResult.rows[0].created_at,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// @desc    Record a payment against a bill
// @route   POST /api/bills/:id/payments
// @access  Private (ADMIN, RECEPTIONIST)
exports.recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amountPaid, paymentMethod, transactionRef } = req.body;

  if (!amountPaid || parseFloat(amountPaid) <= 0 || !paymentMethod) {
    res.status(400);
    throw new Error('Please provide a valid amountPaid and paymentMethod.');
  }

  const billResult = await db.query('SELECT id, total_amount, paid_amount FROM bills WHERE id = $1', [id]);
  if (billResult.rows.length === 0) {
    res.status(404);
    throw new Error(`Bill with ID ${id} not found.`);
  }

  const bill = billResult.rows[0];
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert payment record
    await client.query(
      `INSERT INTO payments (bill_id, amount_paid, payment_method, transaction_ref)
       VALUES ($1, $2, $3, $4)`,
      [id, parseFloat(amountPaid), paymentMethod, transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`]
    );

    // 2. Recalculate total paid amount
    const updatedPaidResult = await client.query(
      `SELECT SUM(amount_paid) as total_paid FROM payments WHERE bill_id = $1`,
      [id]
    );

    const newTotalPaid = parseFloat(updatedPaidResult.rows[0].total_paid || 0);
    const totalAmount = parseFloat(bill.total_amount);

    // 3. Update status
    let newStatus = 'Pending';
    if (newTotalPaid >= totalAmount) {
      newStatus = 'Paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'Partially Paid';
    }

    await client.query(
      `UPDATE bills SET paid_amount = $1, status = $2 WHERE id = $3`,
      [newTotalPaid, newStatus, id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `Payment of $${parseFloat(amountPaid).toFixed(2)} recorded successfully.`,
      data: {
        billId: id,
        paidAmount: newTotalPaid,
        dueAmount: Math.max(0, totalAmount - newTotalPaid),
        status: newStatus,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});
