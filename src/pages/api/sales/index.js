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
        
        const { startDate, endDate } = req.query;
        let whereClause = { company_id: String(company_id) };

        if (startDate && endDate) {
          whereClause.date = {
            gte: new Date(startDate),
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) // End of the day
          };
        }

        const sales = await prisma.sales.findMany({
          where: whereClause,
          include: {
            items: { include: { product: true } },
            debtor_entry: true
          },
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: sales });
        break;

      case 'POST':
        const { items, customer, date, status, paymentMethod, notes, paidAmount } = req.body;
        const targetCompanyId = req.body.company_id || company_id;

        // Debug logging
        console.log('Sales POST received:', { 
          hasItems: !!items, 
          itemsLength: items?.length,
          customer,
          targetCompanyId,
          company_id,
          bodyCompanyId: req.body.company_id
        });

        if (!targetCompanyId) {
          return res.status(400).json({ success: false, message: 'Company ID is required' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, message: 'Items array is required' });
        }

        try {
          const result = await prisma.$transaction(async (tx) => {
            // 1. Calculate Total Amount
            const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const paidAmt = paidAmount !== undefined ? parseFloat(paidAmount) : totalAmount;
            const remainingAmount = totalAmount - paidAmt;
            
            // Determine status based on payment
            let saleStatus = status;
            if (!saleStatus) {
              if (paidAmt >= totalAmount) {
                saleStatus = 'Paid';
              } else if (paidAmt > 0) {
                saleStatus = 'Partial';
              } else {
                saleStatus = 'Unpaid';
              }
            }

            // 2. Create Sale Record
            const sale = await tx.sales.create({
              data: {
                company_id: String(targetCompanyId),
                customer: customer || 'Walk-in',
                date: date ? new Date(date) : new Date(),
                totalAmount: totalAmount,
                // paidAmount: paidAmt, // TODO: Add this after running migration
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

            // 4. Create Debtor Entry if there's an outstanding balance
            if (remainingAmount > 0 && customer && customer !== 'Walk-in') {
              await tx.sundry_debtors.create({
                data: {
                  company_id: String(targetCompanyId),
                  name: customer,
                  sale_id: sale.id,
                  amount: remainingAmount, // Only track the remaining unpaid amount
                  originalAmount: totalAmount,
                  paidAmount: paidAmt,
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

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
