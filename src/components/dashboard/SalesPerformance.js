// src/components/dashboard/SalesPerformance.js

import Chart from '@/components/ui/Chart'; // CORRECTED PATH using '@'

const options = {
  responsive: true,
  maintainAspectRatio: false,
  rotation: -90,
  circumference: 180,
  cutout: '80%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};

const sales = 7500000;
const target = 10000000;
const percentage = (sales / target) * 100;

const data = {
  labels: ['Sales', 'Remaining'],
  datasets: [
    {
      data: [sales, target - sales],
      backgroundColor: ['#4f46e5', '#e5e7eb'],
      borderWidth: 0,
    },
  ],
};

export default function SalesPerformance() {
  return (
    <div className="rounded-lg bg-white p-6 shadow relative h-64">
      <h3 className="text-base font-semibold text-gray-900">Sales vs Target (YTD)</h3>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600">{percentage.toFixed(0)}%</p>
            <p className="text-sm text-gray-500">of ৳10M Target</p>
        </div>
      </div>
      <div className="h-full w-full">
        <Chart type="doughnut" data={data} options={options} />
      </div>
    </div>
  );
}