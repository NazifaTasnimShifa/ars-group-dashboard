// src/pages/fixed-assets.js

import { useAppContext } from '@/contexts/AppContext';
import { fixedAssetsData } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import PageStat from '@/components/ui/PageStat';
import { PlusIcon } from '@heroicons/react/20/solid';

export default function FixedAssetsPage() {
  const { selectedCompany } = useAppContext();
  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;
  const assets = selectedCompany ? fixedAssetsData[selectedCompany.id] : [];

  const totalCost = assets.reduce((sum, a) => sum + a.cost, 0);
  const totalBookValue = assets.reduce((sum, a) => sum + a.bookValue, 0);

  const stats = [
    { name: 'Total Asset Cost', stat: formatCurrency(totalCost) },
    { name: 'Total Book Value', stat: formatCurrency(totalBookValue) },
    { name: 'Total Assets', stat: assets.length },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Fixed Assets Register" description="A list of all long-term assets owned by the company.">
        <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Asset
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        {/* Table code to display assets */}
      </div>
    </DashboardLayout>
  );
}