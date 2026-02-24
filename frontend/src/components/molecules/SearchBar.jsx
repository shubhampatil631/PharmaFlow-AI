import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = "Search molecules..." }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
        </div>
    );
}
