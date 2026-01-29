// src/pages/api/purchases/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query;

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
        const purchases = await prisma.purchases.findMany({
          where: { company_id: String(company_id) },
          include: {
            items: { include: { product: true } },
            creditor_entry: true
          },
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: purchases });
        break;

      case 'POST':
        const { items, supplier, date, amount, status, notes } = req.body;
        const targetCompanyId = req.body.company_id || company_id;

        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, message: 'Items array is required' });
        }

        try {
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create Purchase Record
            const purchase = await tx.purchases.create({
              data: {
                company_id: String(targetCompanyId),
                supplier: supplier,
                date: date ? new Date(date) : new Date(),
                amount: parseFloat(amount),
                status: status || 'Unpaid',
                notes: notes
              }
            });

            // 2. Process Items
            for (const item of items) {
              await tx.purchase_items.create({
                data: {
                  purchase_id: purchase.id,
                  product_id: String(item.productId),
                  quantity: parseInt(item.quantity),
                  unitCost: parseFloat(item.unitCost),
                  total: parseFloat(item.total)
                }
              });

              // Increment Stock & Update Cost
              await tx.inventory_items.update({
                where: { id: String(item.productId) },
                data: {
                  stock: { increment: parseInt(item.quantity) },
                  costPrice: parseFloat(item.unitCost)
                }
              });
            }

            // 3. Create Creditor Entry if Unpaid/Partial
            if ((status === 'Unpaid' || status === 'Partial') && supplier) {
              // Determine due date (default 30 days)
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + 30);

              await tx.sundry_creditors.create({
                data: {
                  company_id: String(targetCompanyId),
                  name: supplier,
                  purchase_id: purchase.id,
                  amount: parseFloat(amount), // Track total amount as payable
                  originalAmount: parseFloat(amount),
                  paidAmount: 0,
                  due: dueDate,
                  status: 'Pending'
                }
              });
            }

            return purchase;
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