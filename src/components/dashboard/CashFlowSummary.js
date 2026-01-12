// src/components/dashboard/CashFlowSummary.js

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

// Mock data based on your financial statements
const cashFlowData = [
    { name: 'Operating Activities', value: -332125, change: -3427630, changeType: 'decrease' },
    { name: 'Investing Activities', value: -7966, change: 4857968, changeType: 'increase' },
    { name: 'Financing Activities', value: -230681, change: -1992412, changeType: 'decrease' },
];

const formatCurrency = (value) => `৳${Math.abs(value).toLocaleString('en-IN')}`;

export default function CashFlowSummary() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Cash Flow Highlights</h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {cashFlowData.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-200">
                <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                    {item.value < 0 ? '-' : ''}{formatCurrency(item.value)}
                </dd>
                <dd className="mt-1 flex items-center text-sm">
                    {item.changeType === 'increase' ? (
                        <ArrowUpIcon className="h-5 w-5 text-green-500" />
                    ) : (
                        <ArrowDownIcon className="h-5 w-5 text-red-500" />
                    )}
                    <span className="ml-1">{formatCurrency(item.change)} vs last year</span>
                </dd>
            </div>
            ))}
        </dl>
    </div>
  );
}