// src/pages/api/creditors/index.js
// ARS ERP - Sundry Creditors API

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
  const { businessId, viewAll } = req.query;

  if (req.method === 'GET') {
    try {
      let businessIds = [];

      if (viewAll === 'true') {
        const allBusinesses = await prisma.business.findMany({
          where: { isActive: true },
          select: { id: true }
        });
        businessIds = allBusinesses.map(b => b.id);
      } else if (businessId) {
        businessIds = [businessId];
      } else {
        return res.status(200).json({ success: true, data: [] });
      }

      const creditors = await prisma.sundry_creditors.findMany({
        where: { company_id: { in: businessIds } },
        orderBy: { amount: 'desc' }
      });

      res.status(200).json({ success: true, data: creditors });

    } catch (error) {
      console.error('Creditors API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, amount, businessId: companyId, due, status } = req.body;

      if (!name || !amount || !companyId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const creditor = await prisma.sundry_creditors.create({
        data: {
          company_id: companyId,
          name,
          amount,
          originalAmount: amount,
          paidAmount: 0,
          due: due ? new Date(due) : null,
          status: status || 'Pending'
        }
      });

      res.status(201).json({ success: true, data: creditor });

    } catch (error) {
      console.error('Creditors POST Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);