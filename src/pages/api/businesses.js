// src/pages/api/businesses.js
// API endpoint to list all businesses (for Super Owner company switching)

import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const businesses = await prisma.business.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        shortName: true,
        type: true,
        address: true,
        phone: true,
        settings: true,
        _count: {
          select: {
            branches: true,
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json(businesses);
  } catch (error) {
    console.error("Businesses API Error:", error);
    return res.status(500).json({ message: 'Failed to fetch businesses' });
  }
}
