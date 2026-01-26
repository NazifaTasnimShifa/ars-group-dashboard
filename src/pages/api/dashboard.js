// src/pages/api/dashboard.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { company_id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!company_id) {
    return res.status(400).json({ success: false, message: 'Company ID required' });
  }

  try {
    const company = await prisma.companies.findUnique({
      where: { id: String(company_id) },
      select: { dashboard_stats: true } // We fetch the JSON blob we seeded
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // In a real app, you would calculate these live from sales/expenses tables.
    // For now, we serve the seeded JSON which matches your requirements perfectly.
    res.status(200).json({ 
      success: true, 
      data: company.dashboard_stats 
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}