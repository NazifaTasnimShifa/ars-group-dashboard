// src/pages/api/dashboard.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { companyId } = req.query;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID is required' });
  }

  try {
    const company = await prisma.companies.findUnique({
      where: { id: companyId },
      select: { dashboard_stats: true }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Return the JSON stored in the dashboard_stats column
    return res.status(200).json(company.dashboard_stats || {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}