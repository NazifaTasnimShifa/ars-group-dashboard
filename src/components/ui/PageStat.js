// src/components/ui/PageStat.js

export default function PageStat({ item }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
    </div>
  );
}