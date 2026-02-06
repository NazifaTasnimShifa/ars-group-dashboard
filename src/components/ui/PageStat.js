// src/components/ui/PageStat.js

export default function PageStat({ item }) {
  if (!item) return null;
  
  return (
    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
      <dd className={`mt-1 text-3xl font-semibold tracking-tight ${item.color || 'text-gray-900'}`}>
        {item.stat}
      </dd>
    </div>
  );
}