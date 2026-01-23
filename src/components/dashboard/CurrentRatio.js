// src/components/dashboard/CurrentRatio.js

// Data from your FY2024 tax files:
// Current Assets: 3,798,535
// Current Liabilities: 5,425,360
const currentAssets = 3798535;
const currentLiabilities = 5425360;
const ratio = currentAssets / currentLiabilities;

const getStatus = (r) => {
    if (r < 1.0) return { text: 'Critical', color: 'red' };
    if (r < 1.5) return { text: 'Caution', color: 'yellow' };
    return { text: 'Healthy', color: 'green' };
}

const status = getStatus(ratio);
const colorClasses = {
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
}

export default function CurrentRatio() {
  return (
    <div className="rounded-lg bg-white p-6 shadow text-center">
        <h3 className="text-base font-semibold text-gray-900">Current Ratio (Liquidity)</h3>
        <p className="mt-4 text-5xl font-bold tracking-tight text-gray-900">{ratio.toFixed(2)}</p>
        <p className="mt-2">
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colorClasses[status.color]}`}>
                {status.text}
            </span>
        </p>
        <p className="text-xs text-gray-500 mt-3">This ratio measures the ability to pay short-term debts. A healthy ratio is typically above 1.5.</p>
    </div>
  );
}