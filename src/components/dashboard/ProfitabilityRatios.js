// src/components/dashboard/ProfitabilityRatios.js

import { ChartBarIcon, ScaleIcon } from '@heroicons/react/24/outline';

// Data calculated from your FY2024 tax files:
// Revenue: 4,926,846
// Gross Profit: 985,369
// Net Loss: -4,588,623
// const grossProfitMargin = (985369 / 4926846) * 100;
// const netProfitMargin = (-4588623 / 4926846) * 100;

export default function ProfitabilityRatios({ data }) { // Accept data as a prop
  return (
    <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Profitability Ratios (FY2024)</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Gross Profit Margin Card */}
            <div className="overflow-hidden rounded-lg bg-green-50 p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <ChartBarIcon className="h-6 w-6 text-green-700" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="truncate text-sm font-medium text-green-800">Gross Profit Margin</dt>
                            <dd>
                                {/* <div className="text-lg font-medium text-green-900">{grossProfitMargin.toFixed(2)}%</div> */}
                                <div className="text-lg font-medium text-green-900">{data.grossMargin.toFixed(2)}%</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Net Profit Margin Card */}
            <div className="overflow-hidden rounded-lg bg-red-50 p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <ScaleIcon className="h-6 w-6 text-red-700" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="truncate text-sm font-medium text-red-800">Net Profit Margin</dt>
                            <dd>
                                {/* <div className="text-lg font-medium text-red-900">{netProfitMargin.toFixed(2)}%</div> */}
                                <div className="text-lg font-medium text-red-900">{data.netMargin.toFixed(2)}%</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
         <p className="text-xs text-gray-500 mt-4">Gross margin shows profit from goods sold. Net margin shows profit after ALL expenses.</p>
    </div>
  );
}