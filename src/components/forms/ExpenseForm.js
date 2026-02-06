// src/components/forms/ExpenseForm.js
// Expense Recording Form with Accrual Support

import { useState, useEffect } from 'react';

const EXPENSE_CATEGORIES = [
    'Salaries & Wages',
    'Office Rent',
    'Utilities',
    'Fuel & Transport',
    'Repairs & Maintenance',
    'Office Supplies',
    'Insurance',
    'Bank Charges',
    'Interest Expense',
    'Depreciation',
    'Marketing & Advertising',
    'Professional Fees',
    'Miscellaneous'
];

export default function ExpenseForm({ expense, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Paid',
        payeeName: '',
        paymentMethod: 'Cash',
        notes: ''
    });

    useEffect(() => {
        if (expense) {
            setFormData({
                category: expense.category || '',
                description: expense.description || '',
                amount: expense.amount || '',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: expense.status || 'Paid',
                payeeName: expense.payeeName || '',
                paymentMethod: expense.paymentMethod || 'Cash',
                notes: expense.notes || ''
            });
        }
    }, [expense]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.category || !formData.amount) {
            alert('Category and Amount are required');
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expense Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select category...</option>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date *</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g., Office electricity bill for December"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Amount & Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount *</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="Paid">Paid</option>
                            <option value="Accrued">Accrued (Pending Payment)</option>
                        </select>
                    </div>
                </div>

                {/* Payee Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Payee Name</label>
                    <input
                        type="text"
                        name="payeeName"
                        value={formData.payeeName}
                        onChange={handleChange}
                        placeholder="e.g., Electricity Company Ltd"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {formData.status === 'Accrued' && (
                        <p className="mt-1 text-sm text-gray-500">
                            A creditor entry will be created for this payee
                        </p>
                    )}
                </div>

                {/* Payment Method (shown for Paid expenses) */}
                {formData.status === 'Paid' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea
                        name="notes"
                        rows="2"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any additional notes..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    Record Expense
                </button>
            </div>
        </form>
    );
}
