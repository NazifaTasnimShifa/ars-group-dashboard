// src/components/forms/DebtorForm.js

export default function DebtorForm({ debtor, onSave, onCancel }) {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Extract data directly from the form DOM
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Add specific logic for types if needed (e.g. convert amounts to numbers)
    data.amount = parseFloat(data.amount);
    data.aging = 0; // New debtors start with 0 aging
    
    // Include ID if we are editing
    if (debtor?.id) {
      data.id = debtor.id;
    }

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Debtor Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Debtor Name</label>
          <div className="mt-2">
            <input type="text" name="name" id="name" defaultValue={debtor?.name || ''} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Rahim Filling Station" />
          </div>
        </div>

        {/* Contact Person */}
        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium leading-6 text-gray-900">Contact Person</label>
          <div className="mt-2">
            <input type="text" name="contactPerson" id="contactPerson" defaultValue={debtor?.contactPerson || ''} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Mr. Rahim" />
          </div>
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email</label>
                <div className="mt-2">
                    <input type="email" name="email" id="email" defaultValue={debtor?.email || ''} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="rahim@example.com"/>
                </div>
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Phone</label>
                <div className="mt-2">
                    <input type="tel" name="phone" id="phone" defaultValue={debtor?.phone || ''} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="+8801..."/>
                </div>
            </div>
        </div>

        {/* Amount and Due Date */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Amount</label>
            <div className="mt-2">
              <input type="number" name="amount" id="amount" defaultValue={debtor?.amount || ''} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 500000" />
            </div>
          </div>
          <div>
            <label htmlFor="due" className="block text-sm font-medium leading-6 text-gray-900">Due Date</label>
            <div className="mt-2">
              <input type="date" name="due" id="due" defaultValue={debtor?.due ? new Date(debtor.due).toISOString().split('T')[0] : ''} required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
            </div>
          </div>
        </div>

      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          {debtor ? 'Update Debtor' : 'Save Debtor'}
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}