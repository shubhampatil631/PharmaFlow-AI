import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Info, FlaskConical, X } from 'lucide-react';
import { SearchBar } from '../components/molecules/SearchBar';
import { FilterPanel } from '../components/molecules/FilterPanel';
import { MoleculeTable } from '../components/molecules/MoleculeTable';
import { moleculeService } from '../services/moleculeService';
import { MoleculeFormModal } from '../components/molecules/MoleculeFormModal';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';

export function MoleculesPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [showInfoBanner, setShowInfoBanner] = useState(true);
    const [searchParams] = useSearchParams();

    const queryParams = {
        page,
        size: 10,
        q: search,
        ...filters
    };

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['molecules', queryParams],
        queryFn: () => moleculeService.getMolecules(queryParams),
        placeholderData: (prev) => prev
    });

    const activeFilterCount = Object.values(filters).flat().length;

    return (
        <div className="space-y-6">
            {/* Enhanced Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="text-sky-600" />
                    Molecule Catalog
                </h1>
                <p className="text-slate-500 mt-1 max-w-2xl">
                    Centralized repository for all pharmaceutical candidates. Track repurposing analysis stages,
                    manage chemical properties, and initiate new AI-driven evaluations.
                </p>
            </div>

            {/* Contextual Info Banner */}
            {showInfoBanner && (
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start justify-between">
                    <div className="flex gap-3">
                        <Info className="text-sky-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-semibold text-sky-900">Understanding the Repurposing Pipeline</h3>
                            <p className="text-sm text-sky-700 mt-1 leading-relaxed">
                                Molecules move through sequential stages:
                                <strong> Ingestion</strong> (Data collection) →
                                <strong> Analysis</strong> (AI evaluation) →
                                <strong> Review</strong> (Human validation).
                                Use the filters to isolate candidates in specific stages.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInfoBanner(false)}
                        className="text-sky-400 hover:text-sky-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center">
                {/* ... existing search components ... */}
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-medium"
                >
                    <Plus size={18} />
                    Add Molecule
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 max-w-md">
                    <SearchBar value={search} onChange={setSearch} />
                </div>
                <div className="flex-1" /> {/* Spacer */}
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium text-sm",
                        activeFilterCount > 0
                            ? "bg-slate-100 border-slate-300 text-slate-900"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                >
                    <Filter size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-slate-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            <MoleculeTable
                data={data?.items || []}
                isLoading={isLoading}
                pagination={{
                    total: data?.total || 0,
                    page: page,
                    size: 10
                }}
                onPageChange={setPage}
            />

            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                onFilterChange={(key, value) => {
                    if (key === 'reset') setFilters({});
                    else setFilters(prev => ({ ...prev, [key]: value }));
                }}
            />

            <MoleculeFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['molecules'] });
                    setIsCreateOpen(false);
                }}
            />
        </div>
    );
}

// Default export also required for lazy loading if used
export default MoleculesPage;
