// src/pages/api/sales/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const sales = await prisma.sales.findMany({
          where: { company_id: String(company_id) },
          include: {
            items: { include: { product: true } },
            debtor_entry: true
          },
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: sales });
        break;

      case 'POST':
        const { items, customer, date, status, paymentMethod, notes } = req.body;
        const targetCompanyId = req.body.company_id || company_id;

        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, message: 'Items array is required' });
        }

        try {
          const result = await prisma.$transaction(async (tx) => {
            // 1. Calculate Total Amount
            const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const saleStatus = status || 'Paid';

            // 2. Create Sale Record
            const sale = await tx.sales.create({
              data: {
                company_id: String(targetCompanyId),
                customer: customer || 'Walk-in',
                date: date ? new Date(date) : new Date(),
                totalAmount: totalAmount,
                status: saleStatus,
                paymentMethod: paymentMethod,
                notes: notes
              }
            });

            // 3. Process Items & Update Stock
            for (const item of items) {
              const product = await tx.inventory_items.findUnique({
                where: { id: String(item.productId) }
              });

              if (!product) throw new Error(`Product not found: ${item.productId}`);
              if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
              }

              // Deduct Inventory
              await tx.inventory_items.update({
                where: { id: String(item.productId) },
                data: { stock: product.stock - item.quantity }
              });

              // Create Sale Item
              await tx.sale_items.create({
                data: {
                  sale_id: sale.id,
                  product_id: String(item.productId),
                  quantity: parseInt(item.quantity),
                  price: parseFloat(item.price)
                }
              });
            }

            // 4. Create Debtor Entry if Unpaid/Partial
            if ((saleStatus === 'Unpaid' || saleStatus === 'Partial') && customer) {
              // Determine amount due (Logic: if Partial, maybe ask user for paid amount? 
              // For now, assume Full Amount if Unpaid, or maybe handling partial logic later.
              // Simple MVP: If Partial/Unpaid, track full amount in debtor ledger, payment reduces it.)
              // Actually, Debtor Ledger usually tracks 'Amount Receivable'. 
              // If 'Partial', we should deduct the 'Paid' amount. But we don't have 'paidAmount' in body yet.
              // For safety, let's assume 'Unpaid' means full amount, 'Partial' means we need to handle it.
              // Let's stick to: Create debtor entry for TOTAL amount, and then a "Receipt" would reduce it.
              // But we don't have receipt logic right here.
              // So if status is NOT 'Paid', we create a debtor entry for the TOTAL amount.

              await tx.sundry_debtors.create({
                data: {
                  company_id: String(targetCompanyId),
                  name: customer,
                  sale_id: sale.id,
                  amount: totalAmount, // Track full amount as receivable initially
                  due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
                }
              });
            }

            return sale;
          });

          res.status(201).json({ success: true, data: result });

        } catch (txError) {
          console.error("Transaction failed:", txError);
          res.status(400).json({ success: false, message: txError.message });
        }
        break;

      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN']);