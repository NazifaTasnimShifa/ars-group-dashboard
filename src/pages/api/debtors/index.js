// src/pages/api/debtors/index.js
// ARS ERP - Sundry Debtors API

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

      const debtors = await prisma.sundry_debtors.findMany({
        where: { company_id: { in: businessIds } },
        orderBy: { amount: 'desc' }
      });

      res.status(200).json({ success: true, data: debtors });

    } catch (error) {
      console.error('Debtors API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, amount, company_id, due, aging } = req.body;

      if (!name || !amount || !company_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields: name, amount, company_id' });
      }

      const debtor = await prisma.sundry_debtors.create({
        data: {
          company_id,
          name,
          amount: parseFloat(amount),
          due: due ? new Date(due) : null,
          aging: aging || 0
        }
      });

      res.status(201).json({ success: true, data: debtor });

    } catch (error) {
      console.error('Debtors POST Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN', 'CASHIER']);
