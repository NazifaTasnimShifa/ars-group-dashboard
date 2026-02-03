// src/components/dashboard/CashFlowSummary.js

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useAppContext } from '@/contexts/AppContext';

// Mock data based on your financial statements
export default function CashFlowSummary({ data }) {
  const { formatCurrency } = useAppContext();
  const { operating = 0, investing = 0, financing = 0 } = data || {};

  const cashFlowItems = [
    { name: 'Operating Activities', value: operating, type: 'operating' },
    { name: 'Investing Activities', value: investing, type: 'investing' },
    { name: 'Financing Activities', value: financing, type: 'financing' },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-base font-semibold leading-6 text-gray-900">Cash Flow Highlights (Period)</h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cashFlowItems.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-200">
            <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              <span className={item.value < 0 ? 'text-red-900' : 'text-green-900'}>
                {item.value < 0 ? '-' : ''}{formatCurrency(item.value)}
              </span>
            </dd>
            {/* Comparison removed as we don't have historical data for simple view yet */}
          </div>
        ))}
      </dl>
    </div>
  );
}