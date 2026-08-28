import React from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, placeholder = 'Search...', onChange, className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
        </div>
    );
};

export default SearchInput;