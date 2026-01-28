// src/components/owner-dashboard/OperationalSnapshot.js
// Operational Snapshot - Combined Companies Data

import { ChartBarIcon, TruckIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function OperationalSnapshot({ data, formatCurrency }) {
  const {
    totalFuelLiftingLitres = 0,
    totalFuelLiftingValue = 0,
    totalSalesValue = 0,
    creditGivenToday = 0,
    creditRecoveredToday = 0,
    currentOutstanding = 0
  } = data || {};

  const snapshotItems = [
    {
      label: 'Total Fuel Lifting',
      primaryValue: `${(totalFuelLiftingLitres / 1000).toFixed(1)}K L`,
      secondaryValue: formatCurrency(totalFuelLiftingValue),
      icon: TruckIcon,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Total Sales Today',
      primaryValue: formatCurrency(totalSalesValue),
      secondaryValue: 'Fuel + Lube + Gas',
      icon: ChartBarIcon,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Credit Given Today',
      primaryValue: formatCurrency(creditGivenToday),
      secondaryValue: 'New credit sales',
      icon: ArrowTrendingUpIcon,
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      label: 'Credit Recovered',
      primaryValue: formatCurrency(creditRecoveredToday),
      secondaryValue: 'Payments received',
      icon: ArrowTrendingDownIcon,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Market Outstanding',
      primaryValue: formatCurrency(currentOutstanding),
      secondaryValue: 'Total debtors',
      icon: CurrencyDollarIcon,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="flex items-center">
          <ChartBarIcon className="h-6 w-6 text-emerald-200 mr-3" />
          <h3 className="text-lg font-semibold text-white">Operational Snapshot</h3>
          <span className="ml-auto text-xs text-emerald-200 bg-emerald-500/30 px-2 py-1 rounded-full">
            Combined View
          </span>
        </div>
      </div>

      {/* Snapshot Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {snapshotItems.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg ${item.bgColor}`}>
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${item.iconBg}`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.iconColor}`}>{item.primaryValue}</p>
              <p className="text-xs text-gray-400 mt-1">{item.secondaryValue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
