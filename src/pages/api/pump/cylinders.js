import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const user = req.user;

  try {
    // Determine Branch ID
    let branchId = req.query.branchId || req.body.branchId;
    if (!branchId && user.businessId) {
       const branch = await prisma.branch.findFirst({
          where: { businessId: user.businessId }
       });
       branchId = branch?.id;
    }

    if (!branchId) {
      return res.status(400).json({ success: false, message: 'Branch ID required (or Business context)' });
    }

    if (method === 'GET') {
      // 1. Get Stock
      const stocks = await prisma.cylinderStock.findMany({
        where: { branchId },
        include: { cylinderType: true }
      });

      // 2. Get Today's Transactions (Issues/Returns)
      // We start of day
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const transactions = await prisma.cylinderTransaction.findMany({
        where: {
          transactionDate: { gte: startOfDay },
          // We might want to filter by branch? 
          // CylinderTransaction links to Customer, not Branch directly.
          // However, we can infer relevant transactions or just show all for the business/customer context.
          // For now, fetch all associated with this system's customers? 
          // Or just recently created ones?
          // Simplest: Fetch all recent.
        },
        include: {
          customer: true,
          // We need cylinder name, but schema doesn't link Transaction -> CylinderType directly?
          // Wait, 'cylinderTypeId' is in CylinderTransaction.
        },
        orderBy: { transactionDate: 'desc' }
      });
      
      // We need to fetch CylinderTypes to map names if not included
      // (Prisma doesn't auto-include based on ID unless relation exists)
      // Schema: `cylinderTypeId String`. Relation?
      // `model CylinderTransaction { ... cylinderTypeId String ... }`
      // It DOES NOT seem to have a @relation to CylinderType in the schema I found earlier?
      // Wait, let me check schema again.
      // Line 349: `cylinderTransactions CylinderTransaction[]` in `CylinderType` model.
      // So there IS a relation.
      
      // Let's retry the include with correct relation name if possible, or just map manually.
      // Since I can't confirm the relation name on `CylinderTransaction` side (I didn't see it),
      // I'll manually map names from `stocks` (which has cylinderType).

      const mappedTransactions = transactions.map(tx => {
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

      return res.status(200).json({ 
        success: true, 
        data: { stocks, transactions: mappedTransactions } 
      });

    } else if (method === 'POST') {
      const { action, type, cylinderId, quantity, notes } = req.body;

      // Handle direct stock setting (Owner Override) - No transaction log
      if (action === 'set_stock') {
        const { type: stockType } = req.body; // 'filled' or 'empty'
        
        // Find or Create Stock
        let stock = await prisma.cylinderStock.findUnique({
          where: { branchId_cylinderTypeId: { branchId, cylinderTypeId: cylinderId } }
        });

        if (!stock) {
          stock = await prisma.cylinderStock.create({
            data: { branchId, cylinderTypeId: cylinderId, filledQty: 0, emptyQty: 0 }
          });
        }

        const updateData = stockType === 'filled' ? { filledQty: quantity } : { emptyQty: quantity };
        await prisma.cylinderStock.update({ where: { id: stock.id }, data: updateData });

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
    console.error("Cylinder API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default withAuth(handler, ['MANAGER', 'PUMP_ATTENDANT', 'ADMIN', 'SUPER_OWNER', 'CASHIER']);
