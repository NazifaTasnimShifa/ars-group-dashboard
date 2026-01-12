// src/components/dashboard/TopExpenses.js
const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

export default function TopExpenses({ data: expenses }) {
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="rounded-lg bg-white p-6 shadow h-full">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Top 5 Expense Accounts</h3>
        <ul role="list" className="mt-4 divide-y divide-gray-100">
            {expenses.map((expense) => (
            <li key={expense.name} className="flex items-center justify-between gap-x-6 py-3">
                <p className="text-sm font-semibold leading-6 text-gray-900">{expense.name}</p>
                <p className="text-sm leading-6 text-gray-900">{formatCurrency(expense.amount)}</p>
            </li>
            ))}
        </ul>
    </div>
  );
}