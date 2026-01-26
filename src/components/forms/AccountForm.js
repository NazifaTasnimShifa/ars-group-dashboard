// src/components/forms/AccountForm.js

export default function AccountForm({ account, onSave, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    data.code = parseInt(data.code);
    data.balance = parseFloat(data.balance || 0);

    if (account?.id) {
        data.id = account.id;
    }

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="code" className="block text-sm font-medium leading-6 text-gray-900">Account Code</label>
                <input type="number" name="code" id="code" defaultValue={account?.code || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g. 1001" />
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">Account Type</label>
                <select name="type" id="type" defaultValue={account?.type || 'Asset'} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600">
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                </select>
            </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Account Name</label>
          <input type="text" name="name" id="name" defaultValue={account?.name || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g. Cash on Hand" />
        </div>

        <div>
          <label htmlFor="balance" className="block text-sm font-medium leading-6 text-gray-900">Opening Balance</label>
          <input type="number" name="balance" id="balance" defaultValue={account?.balance || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
      </div>

      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          {account ? 'Update Account' : 'Save Account'}
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}