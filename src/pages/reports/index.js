// src/pages/reports/index.js

import Link from 'next/link';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import { ChartBarSquareIcon, DocumentChartBarIcon, ScaleIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const reports = [
  {
    name: 'Balance Sheet',
    description: 'Statement of financial position at a specific date.',
    href: '/reports/balance-sheet',
    icon: ScaleIcon,
  },
  {
    name: 'Income Statement',
    description: 'Summary of revenues, costs, and expenses over a period.',
    href: '/reports/income-statement',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Cash Flow Statement',
    description: 'Tracks the movement of cash in and out of the company.',
    href: '/reports/cash-flow',
    icon: BanknotesIcon,
  },
  {
    name: 'Trial Balance',
    description: 'Verifies the equality of debits and credits.',
    href: '/reports/trial-balance',
    icon: DocumentChartBarIcon,
  },
]

export default function ReportsIndexPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Financial Reports"
        description="Select a report to view detailed financial data for your company."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link href={report.href} key={report.name} className="group relative flex flex-col items-start rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow">

            <div>
              <span className="inline-flex rounded-lg bg-indigo-50 p-3 ring-4 ring-white">
                <report.icon className="h-6 w-6 text-indigo-700" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                <span className="absolute inset-0" />
                {report.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{report.description}</p>
            </div>

          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
