// // src/pages/api/data.js
// import prisma from '@/lib/prisma';

// export default async function handler(req, res) {
//   const { companyId, type } = req.query;

//   if (!companyId || !type) {
//     return res.status(400).json({ error: 'Company ID and Type are required' });
//   }

//   // Map the 'type' param to the Prisma model name
//   const modelMap = {
//     'debtors': 'debtors',
//     'creditors': 'creditors',
//     'inventory': 'inventory_items',
//     'sales': 'sales',
//     'purchases': 'purchases',
//     'fixed-assets': 'fixed_assets',
//     'process-loss': 'process_loss',
//     'chart-of-accounts': 'chart_of_accounts',
//   };

//   const modelName = modelMap[type];

//   if (!modelName) {
//     return res.status(400).json({ error: 'Invalid data type' });
//   }

//   try {
//     // --- HANDLE GET (Read) ---
//     if (req.method === 'GET') {
//       const data = await prisma[modelName].findMany({
//         where: { company_id: companyId },
//         orderBy: { id: 'desc' } // Show newest first
//       });
//       return res.status(200).json(data);
//     }

//     // --- HANDLE POST (Create) ---
//     if (req.method === 'POST') {
//       const payload = { ...req.body, company_id: companyId };
      
//       // Remove 'id' if it's empty (let database autogenerate it for Int IDs)
//       if (!payload.id) delete payload.id;

//       const newData = await prisma[modelName].create({
//         data: payload
//       });
//       return res.status(201).json({ success: true, data: newData });
//     }

//     // --- HANDLE DELETE ---
//     if (req.method === 'DELETE') {
//       const { id } = req.body;
      
//       if (!id) return res.status(400).json({ error: 'ID required for delete' });

//       await prisma[modelName].delete({
//         where: { id: id }
//       });
//       return res.status(200).json({ success: true });
//     }

//     // --- HANDLE PUT (Update) ---
//     if (req.method === 'PUT') {
//       const { id, ...data } = req.body;
      
//       if (!id) return res.status(400).json({ error: 'ID required for update' });

//       const updatedData = await prisma[modelName].update({
//         where: { id: id },
//         data: data
//       });
//       return res.status(200).json({ success: true, data: updatedData });
//     }

//     return res.status(405).json({ error: 'Method not allowed' });

//   } catch (error) {
//     console.error(`API Error (${type}):`, error);
//     return res.status(500).json({ error: 'Internal Server Error', details: error.message });
//   }
// }



// src/pages/api/data.js

// src/pages/api/data.js
export default function handler(req, res) {
  res.status(410).json({ 
    error: 'Gone. This endpoint has been removed. Please use specific API routes (e.g., /api/sales, /api/inventory).' 
  });
}