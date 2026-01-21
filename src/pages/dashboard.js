// src/pages/dashboard.js

import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { useAppContext } from '@/contexts/AppContext';
import { 
    ArrowDownIcon, 
    ArrowUpIcon, 
    CurrencyBangladeshiIcon, 
    BanknotesIcon 
} from '@heroicons/react/24/outline';

// Placeholder components for charts and tables we will build next
const RevenueChart = () => <div className="h-96 rounded-lg bg-white p-4 shadow">Chart: Revenue vs Expenses</div>;
const ProfitChart = () => <div className="h-96 rounded-lg bg-white p-4 shadow">Chart: Gross Profit Breakdown</div>;
const DebtorsTable = () => <div className="rounded-lg bg-white p-4 shadow">Table: Sundry Debtors</div>;
const CreditorsTable = () => <div className="rounded-lg bg-white p-4 shadow">Table: Sundry Creditors</div>;


export default function DashboardPage() {
  const { selectedCompany } = useAppContext();

  // This formats numbers to the Taka currency format
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "BDT",
        currencyDisplay: "narrowSymbol", // <- shows "৳"
        minimumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
      { name: 'Opening Balance (2023)', value: formatCurrency(20701199), icon: BanknotesIcon },
      { name: 'Current Balance (2024)', value: formatCurrency(14591956), icon: BanknotesIcon },
      { name: 'Today\'s Expense', value: formatCurrency(5170), icon: ArrowDownIcon },
      { name: 'Today\'s Revenue', value: formatCurrency(13500), icon: ArrowUpIcon },
  ]

  return (
    <DashboardLayout>
      <div>
        {/* KPI Cards Row */}
        <h3 className="text-base font-semibold leading-6 text-gray-900">Last 30 days</h3>
        <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <StatCard 
              key={item.name} 
              title={item.name} 
              value={item.value} 
              icon={item.icon} 
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <RevenueChart />
            <ProfitChart />
        </div>

        {/* Tables Row */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DebtorsTable />
            <CreditorsTable />
        </div>
      </div>
    </DashboardLayout>
  );
}