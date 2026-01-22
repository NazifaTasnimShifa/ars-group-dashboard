// src/components/dashboard/ExpenseBreakdown.js

import Chart from '@/components/ui/Chart'; // CORRECTED PATH using '@'

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      title: {
        display: true,
        text: 'Top Expense Categories',
      },
    },
  };

  const data = {
    labels: ['Financial', 'Admin & General', 'Selling & Marketing'],
    datasets: [
      {
        label: 'Amount (in ৳)',
        data: [3567499, 1893527, 95000],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

export default function ExpenseBreakdown() {
    return (
        <div className="h-64 rounded-lg bg-white p-4 shadow relative">
            <Chart type="pie" data={data} options={options} />
        </div>
    )
}