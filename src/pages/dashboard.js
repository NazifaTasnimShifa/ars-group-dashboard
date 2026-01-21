// src/pages/dashboard.js

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        {/* We will add dashboard cards and charts here in the next step */}
      </div>
    </DashboardLayout>
  );
}