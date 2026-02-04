// src/pages/reports/income-statement.js

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

const StatementRow = ({ name, amount, isTotal = false, isSubtotal = false, indent = false, isLoss = false }) => {
    const formatCurrency = (val) => `৳${(val || 0).toLocaleString('en-IN')}`;
    const amountColor = isLoss ? 'text-red-600' : 'text-gray-800';
    return (
        <div className={`flex justify-between py-2 ${!isTotal && 'border-b border-gray-200'} ${indent && 'pl-6'}`}>
            <p className={`text-sm ${isTotal || isSubtotal ? 'font-semibold' : 'text-gray-600'}`}>
                {name}
            </p>
            <p className={`text-sm ${amountColor} ${isTotal || isSubtotal ? 'font-semibold' : ''}`}>
                {isLoss ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}
            </p>
        </div>
    );
};

export default function IncomeStatementPage() {
  const { currentBusiness, authFetch } = useAppContext();
  const [data, setData] = useState(null);
  // Start with false to avoid infinite loading if context isn't ready immediately
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchData = useCallback(async (range) => {
      // Return early but DO NOT block UI in endless loading state
      if (!currentBusiness?.id || !authFetch) return;
      
      const start = range?.startDate || dateRange.startDate;
      const end = range?.endDate || dateRange.endDate;
      
      if (!start || !end) return;

      try {
        setLoading(true);
        const res = await authFetch(`/api/reports?type=income-statement&companyId=${currentBusiness.id}&startDate=${start}&endDate=${end}`);
        const json = await res.json();
        
        if (res.ok) {
           setData(json);
        } else {
           setError(json.error || 'Failed to fetch report');
           setData(null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    }, [currentBusiness, authFetch, dateRange]);

    const handleFilterChange = (range) => {
      setDateRange(range);
      fetchData(range);
    };

    useEffect(() => {
        if (currentBusiness?.id && dateRange.startDate && dateRange.endDate) {
            fetchData(dateRange);
        }
    }, [currentBusiness, dateRange, fetchData]);

  if (loading) {
     return <DashboardLayout><div className="p-8 text-center">Loading report data...</div></DashboardLayout>;
  }

  if (error) {
     return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-600">
                {error}
                <button onClick={() => fetchData(dateRange)} className="ml-4 underline">Retry</button>
            </div>
        </DashboardLayout>
    );
  }

  if (!data) {
      return (
        <DashboardLayout>
            <div className="p-8 text-center text-gray-500">
                Initializing report...
                {!currentBusiness ? ' (Waiting for Business Context)' : ''}
                {!dateRange.startDate ? ' (Waiting for Dates)' : ''}
                <br/>
                <button onClick={() => fetchData(dateRange)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
                    Load Report
                </button>
            </div>
        </DashboardLayout>
      );
  }

  if (error || !data || !data.revenue) {
     return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-600">
                {error || 'No data available for this report.'}
            </div>
        </DashboardLayout>
    );
  }

  const grossProfit = data.revenue.amount - data.costOfGoodsSold.amount;
  const totalExpenses = data.expenses.administrative.amount + data.expenses.selling.amount + data.expenses.financial.amount;
  const profitBeforeTax = grossProfit - totalExpenses + data.otherIncome.amount;

  return (
    <DashboardLayout>
      <PageHeader
        title="Income Statement"
        description={`A summary of revenues, costs, and expenses for ${currentBusiness.name}.`}
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-end">
            <DateRangeFilter onFilterChange={handleFilterChange} />
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">{currentBusiness.name}</h2>
                <p className="text-sm text-gray-500">Income Statement</p>
                <p className="text-sm text-gray-500">
                    {dateRange.startDate && dateRange.endDate ? 
                        `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}` 
                        : data?.date}
                </p>
            </div>

            <div className="space-y-4">
                <StatementRow name={data.revenue.name} amount={data.revenue.amount} />
                <StatementRow name={`Less: ${data.costOfGoodsSold.name}`} amount={data.costOfGoodsSold.amount} />

                <div className="pt-2 border-t-2 border-gray-400">
                    <StatementRow name="Gross Profit" amount={grossProfit} isSubtotal isLoss={grossProfit < 0} />
                </div>

                <div className="pt-4">
                    <p className="text-sm font-semibold text-gray-600">Less: Operating Expenses</p>
                    <div className="mt-2 space-y-2 border-l-2 border-gray-200 pl-2">
                       <StatementRow name={data.expenses.administrative.name} amount={data.expenses.administrative.amount} indent />
                       <StatementRow name={data.expenses.selling.name} amount={data.expenses.selling.amount} indent />
                       <StatementRow name={data.expenses.financial.name} amount={data.expenses.financial.amount} indent />
                       <StatementRow name="Total Operating Expenses" amount={totalExpenses} isSubtotal indent />
                    </div>
                </div>

                <StatementRow name={`Add: ${data.otherIncome.name}`} amount={data.otherIncome.amount} />

                <div className="mt-4 pt-4 border-t-2 border-gray-800">
                    <StatementRow name="Net Profit / (Loss) Before Tax" amount={profitBeforeTax} isTotal isLoss={profitBeforeTax < 0} />
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
