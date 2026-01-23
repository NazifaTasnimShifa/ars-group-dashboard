// src/pages/accounts/debtors.js

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { sundryDebtors } from '@/data/mockData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { PlusIcon } from '@heroicons/react/20/solid';

export default function DebtorsPage() {
  const [openModal, setOpenModal] = useState(false);
  const { selectedCompany } = useAppContext();

  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  // Prepare data for the table
  const debtors = selectedCompany ? sundryDebtors[selectedCompany.id] : [];
  const tableData = debtors.map(debtor => ({
    ...debtor,
    amount: formatCurrency(debtor.amount),
    aging: `${debtor.aging} days`
  }));

  const tableHeaders = [
    { key: 'name', label: 'Debtor Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'due', label: 'Due Date' },
    { key: 'aging', label: 'Aging' },
  ];

  return (
    <DashboardLayout>
      <Modal open={openModal} setOpen={setOpenModal} title="Add New Debtor">
        <p>This is a placeholder form to add a new debtor. The real form fields would go here.</p>
      </Modal>

      <PageHeader
        title="Sundry Debtors"
        description="A list of all parties who owe money to the company."
      >
        <button
          onClick={() => setOpenModal(true)}
          type="button"
          className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" />
          Add Debtor
        </button>
      </PageHeader>

      <div className="mt-8">
        <Table headers={tableHeaders} data={tableData} />
      </div>
    </DashboardLayout>
  );
}