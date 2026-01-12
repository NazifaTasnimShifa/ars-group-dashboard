// src/components/dashboard/ExpenseBreakdown.js

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
      text: 'Top Expense Categories (FY2024)',
      font: { size: 16 },
    },
  },
};

const data = {
  labels: ['Interest', 'Depreciation', 'Staff Salary', 'Office Rent'],
  datasets: [
    {
      label: 'Amount in ৳',
      data: [3567499, 1291645, 325000, 144000], // Combines both interest lines
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ],
      borderWidth: 1,
    },
  ],
};

export default function ExpenseBreakdown() {
  return (
    <div className="h-80 rounded-lg bg-white p-4 shadow relative">
      <Pie data={data} options={options} />
    </div>
  );
}