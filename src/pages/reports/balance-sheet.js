// src/pages/reports/balance-sheet.js

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { balanceSheetData } from '@/data/mockData';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import DateRangeFilter from '@/components/ui/DateRangeFilter';

const ReportRow = ({ name, amount, isTotal = false, isSubtotal = false, indent = false }) => {
    const formatCurrency = (val) => `৳${(val || 0).toLocaleString('en-IN')}`;    return (
        <div className={`flex justify-between py-2 ${!isTotal && 'border-b'} ${indent && 'pl-6'}`}>
            <p className={`text-sm ${isTotal || isSubtotal ? 'font-bold' : 'text-gray-600'}`}>
                {name}
            </p>
            <p className={`text-sm ${isTotal || isSubtotal ? 'font-bold' : 'text-gray-800'}`}>
                {formatCurrency(amount)}
            </p>
        </div>
    );
};

const ReportSection = ({ title, items }) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return (
        <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-800">{title}</h4>
            <div className="mt-2">
                {items.map(item => <ReportRow key={item.name} name={item.name} amount={item.amount} indent />)}
                <ReportRow name={`Total ${title}`} amount={total} isSubtotal />
            </div>
        </div>
    );
};

export default function BalanceSheetPage() {
  const { currentBusiness, authFetch } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchData = useCallback(async (range) => {
      if (!currentBusiness?.id || !authFetch) return;

      const start = range?.startDate || dateRange.startDate;
      const end = range?.endDate || dateRange.endDate;
      
      if (!start || !end) return;

      try {
        setLoading(true);
        const res = await authFetch(`/api/reports?type=balance-sheet&companyId=${currentBusiness.id}&startDate=${start}&endDate=${end}`);
        const json = await res.json();
        
        if (res.ok) {
           setData(json);
        } else {
           setError(json.error || 'Failed to fetch report');
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

  if (error || !data) {
    return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-600">
                {error || 'No data available for this report.'}
            </div>
        </DashboardLayout>
    );
  }

  const totalNonCurrentAssets = data.assets?.nonCurrent?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalCurrentAssets = data.assets?.current?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalAssets = totalNonCurrentAssets + totalCurrentAssets;

  const totalNonCurrentLiabilities = data.liabilities?.nonCurrent?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalCurrentLiabilities = data.liabilities?.current?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalLiabilities = totalNonCurrentLiabilities + totalCurrentLiabilities;

  const totalEquity = data.equity?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <DashboardLayout>
      <PageHeader
        title="Balance Sheet"
        description={`A statement of the financial position of ${currentBusiness?.name} as at ${data.date}.`}
      />

      <div className="mb-4 flex justify-end">
         <DateRangeFilter onFilterChange={handleFilterChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ASSETS Column */}
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">ASSETS</h3>
            <ReportSection title="Non-Current Assets" items={data.assets?.nonCurrent || []} />
            <ReportSection title="Current Assets" items={data.assets?.current || []} />
            <div className="mt-4 pt-4 border-t-2 border-gray-800">
                <ReportRow name="TOTAL ASSETS" amount={totalAssets} isTotal />
            </div>
        </div>

        {/* LIABILITIES & EQUITY Column */}
        <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">LIABILITIES & EQUITY</h3>
            <ReportSection title="Non-Current Liabilities" items={data.liabilities?.nonCurrent || []} />
            <ReportSection title="Current Liabilities" items={data.liabilities?.current || []} />
            <ReportSection title="Shareholders' Equity" items={data.equity || []} />
            <div className="mt-4 pt-4 border-t-2 border-gray-800">
                <ReportRow name="TOTAL LIABILITIES & EQUITY" amount={totalLiabilitiesAndEquity} isTotal />
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
