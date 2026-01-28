// src/pages/api/purchases/index.js
// Complete Purchase API with Inventory Update and Creditor Entry Creation
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
          include: { items: { include: { product: true } } },
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: purchases });
        break;

      case 'POST':
        // Transactional Purchase Logic with Inventory Update and Creditor Entry
        // Expected body: { company_id, supplier, supplierId, items: [{ productId, quantity, price }], 
        //                  status: 'Paid'|'Partial'|'Unpaid', paidAmount, paymentMethod }
        const { items, supplier, supplierId, date, status, paidAmount, paymentMethod } = req.body;

        // Use company_id from body or query
        const targetCompanyId = req.body.company_id || company_id;

        // Support both new multi-item format and legacy single-amount format
        if (items && Array.isArray(items) && items.length > 0) {
          // New multi-item purchase flow
          try {
            const result = await prisma.$transaction(async (tx) => {
              // 1. Calculate Total Amount
              const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

              // 2. Determine payment status and amounts
              const purchaseStatus = status || 'Paid';
              const amountPaid = purchaseStatus === 'Paid' ? totalAmount : parseFloat(paidAmount || 0);
              const amountDue = totalAmount - amountPaid;

              // 3. Create Purchase Record
              const purchase = await tx.purchases.create({
                data: {
                  company_id: String(targetCompanyId),
                  supplier: supplier || 'Unknown Supplier',
                  date: date ? new Date(date) : new Date(),
                  amount: totalAmount,
                  paidAmount: amountPaid,
                  dueAmount: amountDue,
                  status: purchaseStatus,
                  paymentMethod: paymentMethod || 'Cash',
                }
              });

              // 4. Process Items - Add to inventory
              for (const item of items) {
                // Find or create inventory item
                let product = await tx.inventory_items.findUnique({
                  where: { id: String(item.productId) }
                });

                if (product) {
                  // Update existing inventory - Add stock
                  await tx.inventory_items.update({
                    where: { id: String(item.productId) },
                    data: {
                      stock: product.stock + parseFloat(item.quantity),
                      // Optionally update cost price with weighted average
                      costPrice: item.costPrice ? parseFloat(item.costPrice) : product.costPrice
                    }
                  });
                }

                // Create Purchase Item record
                await tx.purchase_items.create({
                  data: {
                    purchase_id: purchase.id,
                    product_id: String(item.productId),
                    quantity: parseFloat(item.quantity),
                    price: parseFloat(item.price)
                  }
                });
              }

              // 5. Create Creditor Entry if there's an unpaid amount
              if (amountDue > 0) {
                await tx.sundry_creditors.create({
                  data: {
                    company_id: String(targetCompanyId),
                    supplier_id: supplierId || null,
                    name: supplier || 'Unknown Supplier',
                    purchase_id: purchase.id,
                    amount: amountDue,
                    originalAmount: amountDue,
                    paidAmount: 0,
                    due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                    status: 'Pending',
                    createdAt: new Date()
                  }
                });
              }

              return { ...purchase, itemsProcessed: items.length, creditorCreated: amountDue > 0 };
            });

            res.status(201).json({ success: true, data: result });

          } catch (txError) {
            console.error("Transaction failed:", txError);
            res.status(400).json({ success: false, message: txError.message });
          }
        } else {
          // Legacy single-amount purchase (backward compatibility)
          const purchaseStatus = status || req.body.status || 'Unpaid';
          const totalAmount = parseFloat(req.body.amount);
          const amountPaid = purchaseStatus === 'Paid' ? totalAmount : parseFloat(paidAmount || 0);
          const amountDue = totalAmount - amountPaid;

          const purchase = await prisma.purchases.create({
            data: {
              company_id: String(targetCompanyId),
              supplier: supplier || req.body.supplier,
              date: new Date(req.body.date),
              amount: totalAmount,
              paidAmount: amountPaid,
              dueAmount: amountDue,
              status: purchaseStatus,
            },
          });

          // Create creditor entry for legacy flow if unpaid
          if (amountDue > 0) {
            await prisma.sundry_creditors.create({
              data: {
                company_id: String(targetCompanyId),
                name: supplier || req.body.supplier || 'Unknown Supplier',
                purchase_id: purchase.id,
                amount: amountDue,
                originalAmount: amountDue,
                paidAmount: 0,
                due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'Pending',
                createdAt: new Date()
              }
            });
          }

          res.status(201).json({ success: true, data: { ...purchase, creditorCreated: amountDue > 0 } });
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