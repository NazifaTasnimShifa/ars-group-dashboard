// src/pages/reports/income-statement.js

import { useAppContext } from '@/contexts/AppContext';
import { incomeStatementData } from '@/data/mockData';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';

const StatementRow = ({ name, amount, isTotal = false, isSubtotal = false, indent = false, isLoss = false }) => {
    const formatCurrency = (val) => `৳${val.toLocaleString('en-IN')}`;
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
  const { selectedCompany } = useAppContext();
  const data = selectedCompany ? incomeStatementData[selectedCompany.id] : null;

  if (!data) {
    return <DashboardLayout><div>Loading report data...</div></DashboardLayout>;
  }

  const grossProfit = data.revenue.amount - data.costOfGoodsSold.amount;
  const totalExpenses = data.expenses.administrative.amount + data.expenses.selling.amount + data.expenses.financial.amount;
  const profitBeforeTax = grossProfit - totalExpenses + data.otherIncome.amount;

  return (
    <DashboardLayout>
      <PageHeader
        title="Income Statement"
        description={`A summary of revenues, costs, and expenses for ${selectedCompany.name}.`}
      />

      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedCompany.name}</h2>
                <p className="text-sm text-gray-500">Income Statement</p>
                <p className="text-sm text-gray-500">{data.date}</p>
            </div>

            <div className="space-y-4">
                {/* Revenue */}
                <StatementRow name={data.revenue.name} amount={data.revenue.amount} />

                {/* Cost of Goods Sold */}
                <StatementRow name={`Less: ${data.costOfGoodsSold.name}`} amount={data.costOfGoodsSold.amount} />

                {/* Gross Profit */}
                <div className="pt-2 border-t-2 border-gray-400">
                    <StatementRow name="Gross Profit" amount={grossProfit} isSubtotal isLoss={grossProfit < 0} />
                </div>

                {/* Expenses */}
                <div className="pt-4">
                    <p className="text-sm font-semibold text-gray-600">Less: Operating Expenses</p>
                    <div className="mt-2 space-y-2 border-l-2 border-gray-200 pl-2">
                       <StatementRow name={data.expenses.administrative.name} amount={data.expenses.administrative.amount} indent />
                       <StatementRow name={data.expenses.selling.name} amount={data.expenses.selling.amount} indent />
                       <StatementRow name={data.expenses.financial.name} amount={data.expenses.financial.amount} indent />
                       <StatementRow name="Total Operating Expenses" amount={totalExpenses} isSubtotal indent />
                    </div>
                </div>

                {/* Other Income */}
                <StatementRow name={`Add: ${data.otherIncome.name}`} amount={data.otherIncome.amount} />

                {/* Net Profit/Loss */}
                <div className="mt-4 pt-4 border-t-2 border-gray-800">
                    <StatementRow name="Net Profit / (Loss) Before Tax" amount={profitBeforeTax} isTotal isLoss={profitBeforeTax < 0} />
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}