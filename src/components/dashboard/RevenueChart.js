// src/components/dashboard/RevenueChart.js
import { Line } from 'react-chartjs-2';
import FilterButtons from '@/components/ui/FilterButtons';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: false },
  },
};

const labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const data = {
  labels,
  datasets: [
    {
      label: 'Revenue',
      data: [350000, 420000, 400000, 450000, 500000, 480000, 410000, 380000, 390000, 420000, 390000, 346846],
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    },
    {
      label: 'Expenses',
      data: [600000, 650000, 620000, 700000, 710000, 680000, 630000, 590000, 610000, 640000, 600000, 520000],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
  ],
};

export default function RevenueChart() {
  return (
    <div className="h-96 rounded-lg bg-white p-4 shadow flex flex-col">
       <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Revenue vs Expenses</h3>
            <FilterButtons periods={['1M', '6M', '1Y']} />
        </div>
      <div className="flex-grow relative">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}