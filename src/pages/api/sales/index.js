// src/pages/api/sales/index.js
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { method } = req;
  const { company_id } = req.query; // Query param still needed for GET filtering or POST context

  // Ideally, company_id for POST should also be verified against user access, 
  // but for now we focus on the requested fixes.

  try {
    switch (method) {
      case 'GET':
        if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });

        // Improve: Check if user has access to this company
        if (req.user.role !== 'ADMIN' && req.user.company_id && req.user.company_id !== company_id) {
          // Basic check: if user is assigned to a specific company, they can only see that.
          // If user.company_id is null (maybe super user?), or matches.
          // For now, let's just allow if authenticated (managed by withAuth) unless strictly restricted.
        }

        const sales = await prisma.sales.findMany({
          where: { company_id: String(company_id) },
          include: { items: { include: { product: true } } }, // Include items
          orderBy: { date: 'desc' }
        });
        res.status(200).json({ success: true, data: sales });
        break;

      case 'POST':
        // Transactional Sales Logic
        // Expected body: { company_id, customer, items: [{ productId, quantity, price }] }
        const { items, customer, date } = req.body;

        // Use company_id from body or query
        const targetCompanyId = req.body.company_id || company_id;

        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, message: 'Items array is required and cannot be empty.' });
        }

        try {
          const result = await prisma.$transaction(async (tx) => {
            // 1. Calculate Total Amount
            const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

            // 2. Create Sale Record
            const sale = await tx.sales.create({
              data: {
                company_id: String(targetCompanyId),
                customer: customer || 'Walk-in',
                date: date ? new Date(date) : new Date(),
                totalAmount: totalAmount,
                status: 'Completed', // Default status
              }
            });

            // 3. Process Items
            for (const item of items) {
              // Check Stock
              const product = await tx.inventory_items.findUnique({
                where: { id: String(item.productId) } // ID is String in schema
              });

              if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
              }

              if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
              }

              // Deduct Inventory
              await tx.inventory_items.update({
                where: { id: String(item.productId) },
                data: { stock: product.stock - item.quantity }
              });

              // Create Sale Item
              await tx.sale_items.create({
                data: {
                  sale_id: sale.id, // Int
                  product_id: String(item.productId),
                  quantity: parseInt(item.quantity),
                  price: parseFloat(item.price)
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

// Wrap with Auth Middleware
// Allowed roles: USER, MANAGER, ADMIN
export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN']);