// src/components/dashboard/ProfitabilityRatios.js
import { ChartBarIcon, ScaleIcon } from '@heroicons/react/24/outline';

export default function ProfitabilityRatios({ data }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-base font-semibold leading-6 text-gray-900">Profitability Ratios</h3>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-green-50 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-green-700" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-green-800">Gross Profit Margin</dt>
                <dd><div className="text-lg font-medium text-green-900">{data.grossMargin.toFixed(2)}%</div></dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-red-50 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ScaleIcon className="h-6 w-6 text-red-700" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-red-800">Net Profit Margin</dt>
                <dd><div className="text-lg font-medium text-red-900">{data.netMargin.toFixed(2)}%</div></dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">Gross margin shows profit on sales. Net margin is profit after all expenses.</p>
    </div>
  );
}