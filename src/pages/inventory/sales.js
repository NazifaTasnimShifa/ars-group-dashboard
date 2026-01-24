// src/pages/inventory/sales.js

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { salesData } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import PageStat from '@/components/ui/PageStat';
import { PlusIcon } from '@heroicons/react/20/solid';

// Reusable Status Badge Component
const StatusBadge = ({ status }) => { /* ... same as in purchases.js ... */ };

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();
  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  const sales = useMemo(() => {
    const companySales = selectedCompany ? salesData[selectedCompany.id] : [];
    if (!searchQuery) return companySales;
    return companySales.filter(s => 
      s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCompany, searchQuery]);

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const unpaidInvoices = sales.filter(s => s.status === 'Unpaid').length;

  const stats = [
    { name: 'Total Sales (YTD)', stat: formatCurrency(totalSales) },
    { name: 'Unpaid Invoices', stat: unpaidInvoices },
    { name: 'Total Invoices', stat: sales.length },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Sales Invoices" description="A list of all sales made by the company.">
        <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> New Invoice
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        {/* Table and filter code similar to purchases.js */}
      </div>
    </DashboardLayout>
  );
}