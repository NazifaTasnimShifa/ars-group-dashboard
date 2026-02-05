import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { customerId, amount, method, date, reference, notes } = req.body;

  if (!customerId || !amount) {
    return res.status(400).json({ success: false, message: 'Customer and Amount are required' });
  }

  try {
    const paymentAmount = parseFloat(amount);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Debtor
      const debtor = await tx.sundry_debtors.findUnique({
        where: { id: customerId }
      });

      if (!debtor) {
        throw new Error('Customer not found');
      }

      // 2. Update Debtor Balance
      // Decrease 'amount' (current due) and increase 'paidAmount'
      const updatedDebtor = await tx.sundry_debtors.update({
        where: { id: customerId },
        data: {
          amount: { decrement: paymentAmount },
          paidAmount: { increment: paymentAmount },
          updatedAt: new Date()
        }
      });

      // 3. Create a "Sale" record to represent the Receipt/Payment Transaction
      // This is ensuring it shows up in daily financial logs
      const paymentRecord = await tx.sales.create({
        data: {
          company_id: debtor.company_id,
          customer: debtor.name, // Storing name as per existing schema usage
          date: new Date(date || new Date()),
          totalAmount: paymentAmount,
          status: 'Paid',
          paymentMethod: method || 'Cash',
          notes: `Payment Received. Ref: ${reference || '-'} ${notes ? '- ' + notes : ''}`
        }
      });

      return { debtor: updatedDebtor, payment: paymentRecord };
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Payment recorded successfully', 
      data: result 
    });

  } catch (error) {
    console.error('Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment processing failed' });
  }
}

export default withAuth(handler, ['MANAGER', 'ADMIN', 'SUPER_OWNER', 'CASHIER']);
