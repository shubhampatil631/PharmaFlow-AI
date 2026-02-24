import React, { useState, useEffect } from 'react';
import { Search, History, ArrowRight } from 'lucide-react';
import { searchService } from '../../services/searchService';
import clsx from 'clsx';

export function SemanticSearchBar({ onSearch, initialQuery = '', className, large = false }) {
    const [query, setQuery] = useState(initialQuery);
    const [recent, setRecent] = useState([]);
    const [showRecent, setShowRecent] = useState(false);

    useEffect(() => {
        setRecent(searchService.getRecentQueries());
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setShowRecent(false);
        }
    };

    return (
        <div className={clsx("relative w-full", className)}>
            <form onSubmit={handleSubmit} className="relative z-10">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowRecent(true)}
                    placeholder={large ? "Search molecules, reports, patents, or clinical trials..." : "Search..."}
                    className={clsx(
                        "w-full pl-14 pr-14 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 bg-white/90 backdrop-blur-sm",
                        large
                            ? "py-5 text-lg border-slate-200 shadow-xl shadow-indigo-900/5 focus:border-indigo-400 focus:shadow-2xl focus:shadow-indigo-900/10"
                            : "py-2.5 text-sm border-slate-200 shadow-sm focus:border-indigo-300"
                    )}
                />
                <Search className={clsx(
                    "absolute left-5 top-1/2 -translate-y-1/2 transition-colors",
                    query ? "text-indigo-500" : "text-slate-400",
                    large ? "w-6 h-6" : "w-4 h-4"
                )} />
                {query && (
                    <button
                        type="submit"
                        className={clsx(
                            "absolute top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95",
                            large ? "right-3" : "right-1.5 p-1.5 rounded-lg"
                        )}
                    >
                        <ArrowRight className={large ? "w-5 h-5" : "w-4 h-4"} />
                    </button>
                )}
            </form>

            {/* Recent Queries Dropdown */}
            {showRecent && !query && recent.length > 0 && large && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50">
                    <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Searches</p>
                    <div className="space-y-1">
                        {recent.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => { setQuery(q); onSearch(q); setShowRecent(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors group"
                            >
                                <History className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                <span>{q}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
