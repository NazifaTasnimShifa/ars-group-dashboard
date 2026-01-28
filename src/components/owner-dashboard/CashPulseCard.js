// src/components/owner-dashboard/CashPulseCard.js
// Real-Time Cash & Bank Pulse Section

import { BanknotesIcon, ArrowUpIcon, ArrowDownIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

export default function CashPulseCard({ data, formatCurrency }) {
  const {
    dayStartBalance = 0,
    cashInToday = 0,
    cashOutToday = 0,
    cashInHand = 0,
    totalBankBalance = 0
  } = data || {};

  const pulseItems = [
    {
      label: 'Day Start Balance',
      sublabel: '(Opening Cash)',
      value: dayStartBalance,
      icon: BanknotesIcon,
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600'
    },
    {
      label: 'Cash In Today',
      sublabel: '(Sales + Receipts)',
      value: cashInToday,
      icon: ArrowUpIcon,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Cash Out Today',
      sublabel: '(Expenses + Deposits)',
      value: cashOutToday,
      icon: ArrowDownIcon,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      label: 'Cash in Hand',
      sublabel: '(Must Match Physical)',
      value: cashInHand,
      icon: BanknotesIcon,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      highlight: true
    },
    {
      label: 'Bank Balance',
      sublabel: '(All Accounts)',
      value: totalBankBalance,
      icon: BuildingLibraryIcon,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <div className="flex items-center">
          <BanknotesIcon className="h-6 w-6 text-indigo-200 mr-3" />
          <h3 className="text-lg font-semibold text-white">Real-Time Cash & Bank Pulse</h3>
        </div>
      </div>

      {/* Pulse Items Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {pulseItems.map((item, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-lg ${item.bgColor} ${item.highlight ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
            >
              <div className="flex items-center mb-2">
                <item.icon className={`h-5 w-5 ${item.textColor} mr-2`} />
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
              <p className={`text-xl font-bold ${item.textColor}`}>
                {formatCurrency(item.value)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.sublabel}</p>
              {item.highlight && (
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Live
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
