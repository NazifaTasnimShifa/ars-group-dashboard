// src/components/dashboard/ProfitChart.js

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // We only have one dataset, so no legend is needed
    },
    title: {
      display: true,
      text: 'Financial Summary (FY2024)',
      font: {
        size: 16,
      }
    },
  },
  scales: {
    y: {
      ticks: {
        // Format ticks to be more readable (e.g., 4M instead of 4,000,000)
        callback: function(value) {
          if (value >= 1000000) return (value / 1000000) + 'M';
          if (value >= 1000) return (value / 1000) + 'K';
          return value;
        }
      }
    }
  }
};

const labels = ['Revenue', 'Cost of Goods', 'Operating Cost', 'Net Loss'];

const data = {
  labels,
  datasets: [
    {
      label: 'Amount in ৳',
      data: [4926846, 3941477, 1988527, 4588623],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',   // Green for Revenue
        'rgba(255, 159, 64, 0.6)',  // Orange for COGS
        'rgba(255, 205, 86, 0.6)',  // Yellow for Operating Cost
        'rgba(255, 99, 132, 0.6)',   // Red for Net Loss
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

export default function ProfitChart() {
  return (
    <div className="h-96 rounded-lg bg-white p-4 shadow flex flex-col">
      <div className="flex-grow">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}