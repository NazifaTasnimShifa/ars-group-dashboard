// src/components/dashboard/RevenueChart.js
import { Line } from 'react-chartjs-2';
import FilterButtons from '@/components/ui/FilterButtons';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' }, title: { display: false } },
};

export default function RevenueChart({ chartData }) {
  // Default fallback if no data passed
  const labels = chartData?.labels || ['Jan', 'Feb', 'Mar'];
  const revenueData = chartData?.data || [0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      // You can add Expense line here if you calculate monthly expenses similarly in the API
    ],
  };

  return (
    <div className="h-96 rounded-lg bg-white p-4 shadow flex flex-col">
       <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Revenue Trends (2024-2025)</h3>
            <FilterButtons periods={['1Y']} />
        </div>
      <div className="flex-grow relative">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}