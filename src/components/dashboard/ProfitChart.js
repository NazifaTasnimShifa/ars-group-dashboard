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
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Gross Profit Breakdown (FY2024 vs FY2023)',
      },
    },
    scales: {
        x: { stacked: true },
        y: { stacked: true },
    }
  };

const labels = ['Sales', 'Cost of Goods Sold', 'Operating Expenses', 'Net Profit/Loss'];

const data = {
  labels,
  datasets: [
    {
      label: 'FY2024',
      data: [4926846, -3941477, -1988527, -4588623],
      backgroundColor: 'rgb(75, 192, 192)',
    },
    {
      label: 'FY2023',
      data: [4268481, -3385814, -2777761, -5519395],
      backgroundColor: 'rgb(255, 99, 132)',
    },
  ],
};

export default function ProfitChart() {
    return (
        <div className="h-96 rounded-lg bg-white p-4 shadow">
            <Bar options={options} data={data} />
        </div>
    )
}