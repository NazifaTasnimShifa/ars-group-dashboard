// src/pages/api/chart-of-accounts/[id].js
// Dynamic API for individual chart of accounts operations (PUT, DELETE)
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

// Reverse map for saving
const reverseTypeMapping = {
  'Asset': 'ASSET',
  'Liability': 'LIABILITY',
  'Equity': 'EQUITY',
  'Income': 'REVENUE',
  'Expense': 'EXPENSE',
};

async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Account ID required' });
    }

    try {
        switch (method) {
            case 'GET':
                const account = await prisma.chartOfAccount.findUnique({
                    where: { id: String(id) }
                });
                if (!account) {
                    return res.status(404).json({ success: false, message: 'Account not found' });
                }
                res.status(200).json({ success: true, data: account });
                break;

            case 'PUT':
                const { code, name, type, balance } = req.body;
                
                const updatedAccount = await prisma.chartOfAccount.update({
                    where: { id: String(id) },
                    data: {
                        code: code,
                        name: name,
                        accountType: reverseTypeMapping[type] || type,
                        balance: parseFloat(balance || 0)
                    }
                });
                res.status(200).json({ success: true, data: updatedAccount });
                break;

            case 'DELETE':
                // Prevent deletion of system accounts
                const existing = await prisma.chartOfAccount.findUnique({
                    where: { id: String(id) }
                });
                if (existing?.isSystem) {
                    return res.status(400).json({ success: false, message: 'Cannot delete system accounts' });
                }
                
                await prisma.chartOfAccount.delete({
                    where: { id: String(id) }
                });
                res.status(200).json({ success: true, message: 'Account deleted' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).json({ success: false, message: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error('Chart of Accounts API Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN']);
