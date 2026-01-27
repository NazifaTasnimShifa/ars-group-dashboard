// src/components/owner-dashboard/LiabilityWatch.js
// Liability Watch - Depot/Supplier Payables & Debtors

import { ExclamationTriangleIcon, BuildingStorefrontIcon, TruckIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function LiabilityWatch({ data, formatCurrency }) {
  const {
    depotPayable = 0,
    supplierPayable = 0,
    totalDebtors = 0,
    depots = []
  } = data || {};

  const liabilityCards = [
    {
      label: 'Depot / Govt Payable',
      value: depotPayable,
      icon: TruckIcon,
      sublabel: 'Padma + Meghna + Jamuna',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Supplier Payable',
      value: supplierPayable,
      icon: BuildingStorefrontIcon,
      sublabel: 'Lube + Others',
      bgColor: 'bg-rose-50',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-200'
    },
    {
      label: 'Money Owed to You',
      value: totalDebtors,
      icon: BanknotesIcon,
      sublabel: 'Total Debtors',
      bgColor: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      borderColor: 'border-teal-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-orange-200 mr-3" />
          <h3 className="text-lg font-semibold text-white">Liability Watch</h3>
        </div>
      </div>

      {/* Main Cards */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {liabilityCards.map((item, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl ${item.bgColor} border-2 ${item.borderColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${item.iconBg}`}>
                  <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                {item.value > 1000000 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    High
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.iconColor}`}>
                {formatCurrency(item.value)}
              </p>
              <p className="text-xs text-gray-500 mt-2">{item.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Depot Breakdown */}
        {depots && depots.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Depot-wise Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {depots.map((depot, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">{depot.name}</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatCurrency(depot.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
