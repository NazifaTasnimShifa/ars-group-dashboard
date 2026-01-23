// src/components/dashboard/RevenueSources.js

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
      text: 'Revenue by Product Category (YTD)',
      font: {
        size: 16,
      },
    },
  },
};

// Mock data inspired by your business plan
const data = {
  labels: ['Petrol', 'Diesel', 'Lubricants', 'Other'],
  datasets: [
    {
      label: 'Revenue Share',
      data: [2150000, 1550000, 1000000, 226846],
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
      borderWidth: 1,
    },
  ],
};

export default function RevenueSources({ data: revenueData }) { // Accept data
      const chartData = {
      labels: revenueData.labels,
      datasets: [
        {
          label: 'Revenue Share',
          data: revenueData.data,
        },
      ],
    }
  return (
    <div className="rounded-lg bg-white p-4 shadow h-full flex flex-col">
      <div className="flex-grow relative">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}