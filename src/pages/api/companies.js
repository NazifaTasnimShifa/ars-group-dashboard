// src/pages/api/companies.js
// Redirect to businesses API for backward compatibility
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    // Use the new 'business' table instead of old 'companies'
    const businesses = await prisma.business.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        shortName: true,
        code: true,
        type: true
      },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(businesses);
  } catch (error) {
    console.error('Companies API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
}
