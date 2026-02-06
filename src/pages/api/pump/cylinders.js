import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const user = req.user;

  try {
    // Determine Branch ID (optional for GET, required for POST)
    let branchId = req.query.branchId || req.body?.branchId;
    const businessId = req.query.businessId || req.body?.businessId || user?.businessId || user?.company_id;

    if (!branchId && businessId && businessId !== 'all') {
       const branch = await prisma.branch.findFirst({
          where: { businessId: String(businessId) }
       });
       branchId = branch?.id;
    }

    if (method === 'GET') {
      // 1. Get all Cylinder Types (these are global, not per-branch)
      const cylinderTypes = await prisma.cylinderType.findMany({
        where: { isActive: true },
        orderBy: { weight: 'asc' }
      });

      // 2. Get Stock (requires branchId)
      let stocks = [];
      let mappedTransactions = [];

      if (branchId) {
        stocks = await prisma.cylinderStock.findMany({
          where: { branchId },
          include: { cylinderType: true }
        });

        // 3. Get Today's Transactions (Issues/Returns)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const transactions = await prisma.cylinderTransaction.findMany({
          where: {
            transactionDate: { gte: startOfDay },
          },
          include: {
            customer: true,
          },
          orderBy: { transactionDate: 'desc' }
        });

        mappedTransactions = transactions.map(tx => {
          const stockItem = stocks.find(s => s.cylinderTypeId === tx.cylinderTypeId);
          return {
            id: tx.id,
            time: new Date(tx.transactionDate).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
            type: tx.transactionType === 'ISSUE_NEW' ? 'issue' : 
                  tx.transactionType === 'RETURN' ? 'return' : 'other',
            cylinderId: tx.cylinderTypeId,
            cylinderName: stockItem?.cylinderType?.name || 'Unknown Cylinder',
            qty: tx.quantity,
            notes: tx.notes
          };
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: { cylinderTypes, stocks, transactions: mappedTransactions } 
      });

    } else if (method === 'POST') {
      // POST operations require branchId
      if (!branchId) {
        return res.status(400).json({ success: false, message: 'Branch ID required for stock operations' });
      }

      const action = req.body?.action;
      const stockType = req.body?.type; // 'filled' or 'empty'
      const cylinderId = req.body?.cylinderId;
      const quantity = parseInt(req.body?.quantity);
      const notes = req.body?.notes || '';

      if (isNaN(quantity)) {
        return res.status(400).json({ success: false, message: 'Invalid quantity' });
      }

      if (!cylinderId) {
        return res.status(400).json({ success: false, message: 'Cylinder ID required' });
      }

      // Handle direct stock setting (Owner Override) - No transaction log
      if (action === 'set_stock') {
        const updateData = stockType === 'filled' ? { filledQty: quantity } : { emptyQty: quantity };
        
        await prisma.cylinderStock.upsert({
          where: { 
            branchId_cylinderTypeId: { 
              branchId: String(branchId), 
              cylinderTypeId: String(cylinderId) 
            } 
          },
          update: updateData,
          create: {
            branchId: String(branchId),
            cylinderTypeId: String(cylinderId),
            filledQty: stockType === 'filled' ? quantity : 0,
            emptyQty: stockType === 'empty' ? quantity : 0,
            damagedQty: 0
          }
        });

        return res.status(200).json({ success: true, message: 'Stock updated' });
      }

      // Handle Operational Transactions (Receive/Issue/Return)
      await prisma.$transaction(async (tx) => {
        // 1. Ensure Stock Exists
        let stock = await tx.cylinderStock.findUnique({
            where: { branchId_cylinderTypeId: { branchId, cylinderTypeId: cylinderId } }
        });

        if (!stock) {
            stock = await tx.cylinderStock.create({
                data: { branchId, cylinderTypeId: cylinderId, filledQty: 0, emptyQty: 0 }
            });
        }

        // 2. Determine Transaction Logic
        let updateData = {};
        let txnType = null; // Enum: ISSUE_NEW, SWAP, RETURN...

        if (type === 'receive') {
            // "Receive" = Stock In (Purchase). 
            // We DO NOT have a handy CylinderTransaction type for "Purchase" (Receive).
            // So we only update stock.
            updateData = { filledQty: { increment: quantity } };
        } else if (type === 'issue') {
            if (stock.filledQty < quantity) throw new Error("Insufficient filled stock");
            updateData = { 
                filledQty: { decrement: quantity },
                emptyQty: { increment: quantity } // Logic: giving filled, taking empty (swap)
            };
            txnType = 'ISSUE_NEW'; 
        } else if (type === 'return') {
             if (stock.emptyQty < quantity) throw new Error("Insufficient empty stock");
             updateData = { emptyQty: { decrement: quantity } };
             txnType = 'RETURN'; // Logic: returning empties to supplier? 
             // Wait. "Return Empty" in UI usually means giving empty to Supplier.
             // But `CylinderTransaction` 'RETURN' usually means Customer returning cylinder.
             // Creating a transaction record for "Returning to Supplier" might be wrong if the table is for Customers.
             // But for the sake of the "List", we might want to log it.
             // Let's assume 'RETURN' is fine here or just don't log "Supplier Return".
             // Actually, if it's "Return" -> Stock decreases.
             // If we use 'RETURN' enum, it implies we received a return?
             // No, 'RETURN' usually means Inward.
             // Let's look at `cylinder-operations.js`: 
             // "Return Empty" -> `handleStockChange(..., 'empty', -qty)` -> Decreases Empty Stock.
             // This corresponds to "Sending Empties to Supplier".
             // `CylinderTransaction` is likely for Customer flow.
             // So `ISSUE` (Out to Customer) is valid.
             // `RETURN` (In from Customer) would increase Empty stock.
             // But our UI "Return Empty" DECREASES Empty stock (Sending back to supplier).
             // So, UI "Return Empty" != `CylinderTxnType.RETURN`.
             // Conclusion: Only `type === 'issue'` maps cleanly to `CylinderTransaction.ISSUE_NEW`.
             // `receive` (Purchase) and `return` (Supplier Return) are Back-office ops.
             // I will ONLY log `issue` for now to avoid polluting Customer Data with Supplier Ops.
        }

        // 3. Update Stock
        await tx.cylinderStock.update({ where: { id: stock.id }, data: updateData });

        // 4. Create Transaction Record (Only for Issue currently)
        if (txnType) {
            // Find Default Walk-in Customer
            let customer = await tx.cylinderCustomer.findFirst({ where: { name: 'Walk-in Customer' } });
            if (!customer) {
                customer = await tx.cylinderCustomer.create({
                    data: { name: 'Walk-in Customer', phone: '0000000000' }
                });
            }

            await tx.cylinderTransaction.create({
                data: {
                    customerId: customer.id,
                    cylinderTypeId: cylinderId,
                    transactionType: txnType,
                    quantity: quantity,
                    totalAmount: 0, // We need price? Using 0 for now as UI doesn't send price
                    paymentMode: 'CASH', // Default
                    notes: notes
                }
            });
        }
      });

      return res.status(200).json({ success: true, message: 'Transaction recorded' });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Cylinder API Error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      query: req.query,
      user: user?.id
    });
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
}

export default withAuth(handler, ['MANAGER', 'PUMP_ATTENDANT', 'ADMIN', 'SUPER_OWNER', 'CASHIER']);
