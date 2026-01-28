// src/components/owner-dashboard/CompanyBreakdown.js
// Company-wise Breakdown Cards

import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export default function CompanyBreakdown({ companies, formatCurrency }) {
  if (!companies || companies.length === 0) return null;

  const typeLabels = {
    'PETROL_PUMP': 'Fuel Station',
    'LUBRICANT': 'Lubricant Distribution',
    'GAS_CYLINDER': 'Gas Cylinder'
  };

  const typeColors = {
    'PETROL_PUMP': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      accent: 'text-amber-600'
    },
    'LUBRICANT': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      accent: 'text-blue-600'
    },
    'GAS_CYLINDER': {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      badge: 'bg-cyan-100 text-cyan-700',
      accent: 'text-cyan-600'
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700">
        <div className="flex items-center">
          <BuildingOffice2Icon className="h-6 w-6 text-slate-200 mr-3" />
          <h3 className="text-lg font-semibold text-white">Company-wise Breakdown</h3>
        </div>
      </div>

      {/* Company Cards */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company, index) => {
            const colors = typeColors[company.type] || typeColors['PETROL_PUMP'];
            return (
              <div
                key={index}
                className={`p-5 rounded-xl ${colors.bg} border-2 ${colors.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{company.name}</h4>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {typeLabels[company.type] || company.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Today&apos;s Sales</p>
                    <p className={`text-lg font-bold ${colors.accent}`}>
                      {formatCurrency(company.todaySales || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cash in Hand</p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrency(company.cashInHand || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Receivables</p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrency(company.receivables || 0)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
