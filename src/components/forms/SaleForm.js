// src/components/forms/SaleForm.js

export default function SaleForm({ sale, onSave, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    data.amount = parseFloat(data.amount);
    // Default status for new sales
    if(!sale) data.status = 'Unpaid'; 

    if (sale?.id) {
        data.id = sale.id;
    } else {
        data.id = `INV-${Date.now().toString().slice(-6)}`;
    }

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium leading-6 text-gray-900">Customer Name</label>
          <input type="text" name="customer" id="customer" defaultValue={sale?.customer || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">Date</label>
          <input type="date" name="date" id="date" defaultValue={sale?.date ? new Date(sale.date).toISOString().split('T')[0] : ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Invoice Amount</label>
          <input type="number" name="amount" id="amount" defaultValue={sale?.amount || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{sale ? 'Update' : 'Record'} Sale</button>
      </div>
    </form>
  );
}