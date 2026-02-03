// src/components/dashboard/SalesPerformance.js
import { Doughnut } from 'react-chartjs-2';

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

export default function SalesPerformance({ achieved = 0, target = 1 }) {
  // Ensure target is not zero to avoid division by zero
  const safeTarget = target > 0 ? target : 1;
  const percentage = (achieved / safeTarget) * 100;

  const chartData = {
    labels: ['Achieved', 'Remaining'],
    datasets: [
      {
        data: [achieved, Math.max(0, safeTarget - achieved)],
        backgroundColor: ['#4f46e5', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const formatShort = (num) => {
      if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num;
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow relative h-64">
      <h3 className="text-base font-semibold text-gray-900">Sales vs Target</h3>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-6">
        <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{percentage.toFixed(0)}%</p>
            <p className="text-xs text-gray-500">of ৳{formatShort(safeTarget)} Target</p>
        </div>
      </div>
      <div className="h-full w-full">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}