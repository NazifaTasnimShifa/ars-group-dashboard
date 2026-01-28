// src/pages/api/expenses/index.js
// Expense Tracking API with Creditor Entry for Accrued Expenses
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const { company_id } = req.query;

    try {
        switch (method) {
            case 'GET':
                if (!company_id) return res.status(400).json({ success: false, message: 'Company ID required' });
                const expenses = await prisma.expenses.findMany({
                    where: { company_id: String(company_id) },
                    orderBy: { date: 'desc' }
                });
                res.status(200).json({ success: true, data: expenses });
                break;

            case 'POST':
                // Expense Recording with optional Creditor Entry for accrued expenses
                // Expected body: { company_id, category, description, amount, date, 
                //                  status: 'Paid'|'Accrued', payeeName, paymentMethod }
                const { category, description, amount, date, status, payeeName, paymentMethod } = req.body;
                const targetCompanyId = req.body.company_id || company_id;

                if (!amount || !category) {
                    return res.status(400).json({ success: false, message: 'Amount and category are required' });
                }

                const expenseStatus = status || 'Paid';
                const expenseAmount = parseFloat(amount);

                try {
                    const result = await prisma.$transaction(async (tx) => {
                        // 1. Create Expense Record
                        const expense = await tx.expenses.create({
                            data: {
                                company_id: String(targetCompanyId),
                                category: category,
                                description: description || '',
                                amount: expenseAmount,
                                date: date ? new Date(date) : new Date(),
                                status: expenseStatus,
                                payeeName: payeeName || null,
                                paymentMethod: paymentMethod || 'Cash',
                            }
                        });

                        // 2. Create Creditor Entry if expense is accrued (not paid yet)
                        if (expenseStatus === 'Accrued' && payeeName) {
                            await tx.sundry_creditors.create({
                                data: {
                                    company_id: String(targetCompanyId),
                                    name: payeeName,
                                    expense_id: expense.id,
                                    amount: expenseAmount,
                                    originalAmount: expenseAmount,
                                    paidAmount: 0,
                                    due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                                    status: 'Pending',
                                    createdAt: new Date()
                                }
                            });
                        }

                        return { ...expense, creditorCreated: expenseStatus === 'Accrued' };
                    });

                    res.status(201).json({ success: true, data: result });

                } catch (txError) {
                    console.error("Transaction failed:", txError);
                    res.status(400).json({ success: false, message: txError.message });
                }
                break;

            default:
                res.status(405).json({ success: false, message: 'Method not allowed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export default withAuth(handler, ['USER', 'MANAGER', 'ADMIN']);
