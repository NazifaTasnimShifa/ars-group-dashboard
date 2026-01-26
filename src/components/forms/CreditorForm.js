// src/components/forms/CreditorForm.js

export default function CreditorForm({ creditor, onSave, onCancel }) {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Convert numeric strings to numbers
    data.amount = parseFloat(data.amount);
    data.aging = 0; // Default for new creditors

    if (creditor?.id) {
      data.id = creditor.id;
    }

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Creditor Name</label>
          <div className="mt-2">
            <input type="text" name="name" id="name" defaultValue={creditor?.name || ''} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Govt. Fuel Depot" />
          </div>
        </div>

        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium leading-6 text-gray-900">Contact Person</label>
          <div className="mt-2">
            <input type="text" name="contactPerson" id="contactPerson" defaultValue={creditor?.contactPerson || ''} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Accounts Officer" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Amount Due</label>
            <div className="mt-2">
              <input type="number" name="amount" id="amount" defaultValue={creditor?.amount || ''} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 1500000" />
            </div>
          </div>
          <div>
            <label htmlFor="due" className="block text-sm font-medium leading-6 text-gray-900">Due Date</label>
            <div className="mt-2">
              <input type="date" name="due" id="due" defaultValue={creditor?.due ? new Date(creditor.due).toISOString().split('T')[0] : ''} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          {creditor ? 'Update Creditor' : 'Save Creditor'}
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}