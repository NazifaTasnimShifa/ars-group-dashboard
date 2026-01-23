import DashboardLayout from "@/components/layout/DashboardLayout";

export default function BalanceSheetPage() {
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Balance Sheet</h1>
            <p className="mt-2 text-sm text-gray-700">A detailed view of the company's financial balance.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}