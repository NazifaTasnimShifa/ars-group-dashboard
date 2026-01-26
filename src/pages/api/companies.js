// src/pages/api/companies.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    const companies = await prisma.companies.findMany({
      select: {
        id: true,
        name: true,
        shortName: true
      }
    });
    return res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
}