// src/pages/api/expenses/[id].js
// Dynamic API for individual expense operations (PUT, DELETE)
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Expense ID required' });
    }

    try {
        switch (method) {
            case 'GET':
                const expense = await prisma.expenses.findUnique({
                    where: { id: String(id) }
                });
                if (!expense) {
                    return res.status(404).json({ success: false, message: 'Expense not found' });
                }
                res.status(200).json({ success: true, data: expense });
                break;

            case 'PUT':
                const { category, description, amount, date, status, payeeName, paymentMethod, notes } = req.body;
                
                const updatedExpense = await prisma.expenses.update({
                    where: { id: String(id) },
                    data: {
                        category: category,
                        description: description || '',
                        amount: parseFloat(amount),
                        date: date ? new Date(date) : undefined,
                        status: status,
                        payeeName: payeeName || null,
                        paymentMethod: paymentMethod || 'Cash',
                        notes: notes || null
                    }
                });
                res.status(200).json({ success: true, data: updatedExpense });
                break;

            case 'DELETE':
                // Also delete related creditor entry if exists
                await prisma.$transaction(async (tx) => {
                    // Check for related creditor
                    await tx.sundry_creditors.deleteMany({
                        where: { expense_id: String(id) }
                    });
                    
                    // Delete the expense
                    await tx.expenses.delete({
                        where: { id: String(id) }
                    });
                });
                res.status(200).json({ success: true, message: 'Expense deleted' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).json({ success: false, message: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error('Expense API Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN']);
