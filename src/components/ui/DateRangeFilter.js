import { useState, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

const presets = [
    { label: '1D', days: 1 },
    { label: '3D', days: 3 },
    { label: '7D', days: 7 },
    { label: '15D', days: 15 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
];

export default function DateRangeFilter({ onFilterChange, initialRange = '1M' }) {
    const [selectedRange, setSelectedRange] = useState(initialRange);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    // Initial load - default to Current Month
    useEffect(() => {
        applyCurrentMonth();
    }, []);

    const applyCurrentMonth = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

        const startStr = firstDay.toISOString().split('T')[0];
        const endStr = lastDay.toISOString().split('T')[0];

        setSelectedRange('Current Month');
        setIsCustom(false);
        setStartDate(startStr);
        setEndDate(endStr);
        onFilterChange({ startDate: startStr, endDate: endStr });
    };

    const handlePresetClick = (preset) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - preset.days + 1); // +1 because today is inclusive

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        setSelectedRange(preset.label);
        setIsCustom(false);
        setStartDate(startStr);
        setEndDate(endStr);
        onFilterChange({ startDate: startStr, endDate: endStr });
    };

    const handleCustomChange = (type, val) => {
        setIsCustom(true);
        setSelectedRange('Custom');
        
        // Update local state immediately for input
        if (type === 'start') setStartDate(val);
        else setEndDate(val);

        // Only fire callback if both are set
        if ((type === 'start' && val && endDate) || (type === 'end' && startDate && val)) {
             onFilterChange({ 
                 startDate: type === 'start' ? val : startDate, 
                 endDate: type === 'end' ? val : endDate 
            });
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-md shadow-sm border border-gray-200">
             <div className="flex items-center space-x-1 border-r pr-2 mr-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            {/* Quick Presets */}
            <div className="flex space-x-1">
                 <button 
                    onClick={applyCurrentMonth}
                    className={`px-2 py-1 text-xs font-semibold rounded ${selectedRange === 'Current Month' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    Current Month
                </button>
                {presets.map(p => (
                    <button
                        key={p.label}
                        onClick={() => handlePresetClick(p)}
                        className={`px-2 py-1 text-xs font-semibold rounded ${selectedRange === p.label ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Custom Range */}
            <div className="flex items-center space-x-2 border-l pl-2 ml-2">
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => handleCustomChange('start', e.target.value)}
                    className="block w-32 rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => handleCustomChange('end', e.target.value)}
                    className="block w-32 rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-xs"
                />
            </div>
        </div>
    );
}
