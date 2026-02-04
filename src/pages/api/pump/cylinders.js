import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const user = req.user;

  try {
    if (method === 'GET') {
      // Get Cylinder Stock for the user's branch
      // Assuming user.businessId is available. Best to use branchId if available.
      // If user is Owner, they might need to specify branch.
      // For now, let's grab the first branch of the business or use user.branchId if it existed.
      // The schema has `branchId` in `CylinderStock`.
      // Let's rely on query param OR find default branch.
      
      let { branchId } = req.query;
      
      if (!branchId && user.businessId) {
         // Find default branch
         const branch = await prisma.branch.findFirst({
            where: { businessId: user.businessId }
         });
         branchId = branch?.id;
      }

      if (!branchId) {
        return res.status(400).json({ success: false, message: 'Branch ID required' });
      }

      const stocks = await prisma.cylinderStock.findMany({
        where: { branchId },
        include: { cylinderType: true }
      });

      // Also fetch today's transactions for the UI list
      // We can't easily filter "today's transactions" from just Stock.
      // Transaction log is separate.
      // Let's just return stock for now, and maybe transactions if needed.
      // But CylinderTransaction requires customerId. 
      // If we aren't using CylinderTransaction for everything, we can't return them all.
      // The UI expects a list of transactions.
      // Implementation choice: We will ONLY track Stock persistence for now to satisfy "Values Updating".
      // Transaction list will be transient or empty until we fully implement the ledger.
      
      return res.status(200).json({ 
        success: true, 
        data: { stocks } 
      });

    } else if (method === 'POST') {
      const { type, cylinderId, quantity, notes } = req.body;
      let { branchId } = req.body;

      if (!branchId && user.businessId) {
         const branch = await prisma.branch.findFirst({
            where: { businessId: user.businessId }
         });
         branchId = branch?.id;
      }

      if (!branchId) return res.status(400).json({ success: false, message: 'Branch ID missing' });

      await prisma.$transaction(async (tx) => {
        // Ensure stock record exists
        let stock = await tx.cylinderStock.findUnique({
            where: {
                branchId_cylinderTypeId: {
                    branchId: branchId,
                    cylinderTypeId: cylinderId
                }
            }
        });

        if (!stock) {
            stock = await tx.cylinderStock.create({
                data: {
                    branchId,
                    cylinderTypeId: cylinderId,
                    filledQty: 0,
                    emptyQty: 0
                }
            });
        }

        // Update Logic based on UI "type"
        // receive: "Refill/Purchase" -> +Filled
        // issue: "Sell/Swap" -> -Filled, +Empty (assuming swap) OR just -Filled if outright sell.
        // The UI logic in `cylinder-operations.js` was:
        // if (type === 'receive') { handleStockChange(cylinderId, 'filled', qty); }
        // else if (type === 'issue') { handleStockChange(cylinderId, 'filled', -qty); handleStockChange(cylinderId, 'empty', qty); }
        // else if (type === 'return') { handleStockChange(cylinderId, 'empty', -qty); }
        
        let updateData = {};
        
        if (type === 'receive') {
            updateData = { filledQty: { increment: quantity } };
        } else if (type === 'issue') {
            // Check stock
            if (stock.filledQty < quantity) throw new Error("Insufficient filled stock");
            updateData = { 
                filledQty: { decrement: quantity },
                emptyQty: { increment: quantity } // Assuming swap logic from UI
            };
        } else if (type === 'return') {
            // Return empties to supplier
             if (stock.emptyQty < quantity) throw new Error("Insufficient empty stock");
             updateData = { emptyQty: { decrement: quantity } };
        }

        await tx.cylinderStock.update({
            where: { id: stock.id },
            data: updateData
        });
      });

      return res.status(200).json({ success: true, message: 'Stock updated' });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("Cylinder API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default withAuth(handler, ['MANAGER', 'PUMP_ATTENDANT', 'ADMIN', 'SUPER_OWNER']);
