// src/components/ui/FilterButtons.js

import { useState } from 'react';

export default function FilterButtons({ periods }) {
    const [active, setActive] = useState(periods[periods.length - 1]); // Default to the last one (e.g., 1Y)

    return (
        <div>
            {periods.map((period) => (
                <button
                    key={period}
                    onClick={() => setActive(period)}
                    type="button"
                    className={`px-3 py-1 text-sm font-semibold rounded-md mr-2 ${
                        active === period
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                    {period}
                </button>
            ))}
        </div>
    );
}