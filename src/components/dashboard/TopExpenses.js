// src/components/dashboard/TopExpenses.js

// Data from your FY2024 tax files
const expenses = [
    { name: 'Interest Charged by Bank', amount: 909319 },
    { name: 'Interest Provision', amount: 2658180 },
    { name: 'Depreciation', amount: 1291645 },
    { name: 'Staff Salary & Allowances', amount: 325000 },
    { name: 'Office Rent', amount: 144000 },
];

const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

export default function TopExpenses() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Top 5 Expense Accounts (FY2024)</h3>
        <ul role="list" className="mt-4 divide-y divide-gray-100">
            {expenses.map((expense) => (
            <li key={expense.name} className="flex items-center justify-between gap-x-6 py-3">
                <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-gray-900">{expense.name}</p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                    <div className="flex flex-col items-end">
                        <p className="text-sm leading-6 text-gray-900">{formatCurrency(expense.amount)}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                            {((expense.amount / totalExpenses) * 100).toFixed(1)}% of total
                        </p>
                    </div>
                </div>
            </li>
            ))}
        </ul>
    </div>
  );
}