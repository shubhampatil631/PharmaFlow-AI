import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SemanticSearchBar } from '../components/search/SemanticSearchBar';
import { NlpSummaryCard } from '../components/search/NlpSummaryCard';
import { EntityFilters } from '../components/search/EntityFilters';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { searchService } from '../services/searchService';
import { Sparkles, Beaker, FileText, FileSpreadsheet, Search } from 'lucide-react';

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);

    useEffect(() => {
        if (query) {
            handleSearch(query);
        } else {
            setResults(null);
        }
    }, [query]);

    useEffect(() => {
        if (query) {
            handleSearch(query, selectedFilters);
        }
    }, [selectedFilters]);

    const handleSearch = async (searchQuery, filters = selectedFilters) => {
        setIsSearching(true);
        if (searchQuery !== query) {
            setSearchParams({ q: searchQuery });
        }
        try {
            const data = await searchService.search({
                query: searchQuery,
                filters: filters
            });
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuickAction = (filterType, hintQuery) => {
        setSelectedFilters([filterType]);
        if (hintQuery) handleSearch(hintQuery, [filterType]);
    };

    // Landing View
    if (!query) {
        return (
            <div className="h-[calc(100vh-80px)] -mt-8 -mx-8 bg-gradient-to-b from-indigo-50/50 via-white to-white flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-3xl mx-auto text-center space-y-8">

                    {/* Hero Header */}
                    <div className="space-y-4 animate-fade-in">
                        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-2 shadow-inner">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Discovery Engine</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
                            Search across generated AI reports, uploaded scientific literature, and internal compound databases.
                        </p>
                    </div>

                    {/* Main Search Bar */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <SemanticSearchBar
                            onSearch={handleSearch}
                            large={true}
                            className="relative z-10"
                        />
                    </div>

                    {/* Quick Sources */}
                    <div className="pt-8">
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Explore Intelligence Sources</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleQuickAction('molecule', 'kinase inhibitor')}
                                className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Beaker className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Molecules</h3>
                                <p className="text-xs text-slate-500 mt-1 text-center">Search structure and properties</p>
                            </button>

                            <button
                                onClick={() => handleQuickAction('report', 'market forecast')}
                                className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900">AI Reports</h3>
                                <p className="text-xs text-slate-500 mt-1 text-center">Search generated deep analysis</p>
                            </button>

                            <button
                                onClick={() => handleQuickAction('document', 'clinical trial results')}
                                className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Documents</h3>
                                <p className="text-xs text-slate-500 mt-1 text-center">Search uploaded PDFs & literature</p>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // Results View
    return (
        <div className="max-w-[1600px] mx-auto min-h-screen pb-12">
            {/* Sticky Top Bar (Glassmorphism) */}
            <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 pt-6 pb-4 mb-8 -mx-8 px-8 shadow-sm">
                <div className="max-w-4xl flex items-center gap-4">
                    <div className="flex-1">
                        <SemanticSearchBar
                            initialQuery={query}
                            onSearch={handleSearch}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-3">
                    <div className="sticky top-32">
                        <EntityFilters selected={selectedFilters} onChange={setSelectedFilters} />
                    </div>
                </div>

                {/* Main Results */}
                <div className="lg:col-span-9 space-y-6">
                    {isSearching ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : results ? (
                        <>
                            {results.summary && (
                                <div className="mb-8">
                                    <NlpSummaryCard summary={results.summary} />
                                </div>
                            )}

                            <div className="space-y-5">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        Search Results
                                    </h2>
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        {results.total_results} matches found
                                    </span>
                                </div>

                                {results.results.map(item => (
                                    <SearchResultCard key={item.id} result={{
                                        ...item,
                                        snippet: item.subtitle,
                                        tags: [item.type.toUpperCase()],
                                        date: item.metadata?.generated_date || new Date().toISOString()
                                    }} />
                                ))}

                                {results.results.length === 0 && (
                                    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No matches found</h3>
                                        <p className="text-slate-500">Try adjusting your keywords or clearing filters.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
