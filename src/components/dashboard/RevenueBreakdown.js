// src/components/dashboard/RevenueBreakdown.js

import { Pie } from 'react-chartjs-2';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Top Revenue Sources (Mock)',
      font: { size: 16 },
    },
  },
};

// Mock data based on your business plan
const data = {
  labels: ['Petrol Sales', 'Diesel Sales', 'Lube Sales', 'LPG Sales'],
  datasets: [
    {
      label: 'Revenue in ৳',
      data: [2000000, 1500000, 1000000, 426846],
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ],
      borderWidth: 1,
    },
  ],
};

export default function RevenueBreakdown() {
  return (
    <div className="h-80 rounded-lg bg-white p-4 shadow relative">
      <Pie data={data} options={options} />
    </div>
  );
}