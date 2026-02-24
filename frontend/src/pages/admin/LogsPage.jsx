import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { opsService } from '../../services/opsService';
import { LogViewer } from '../../components/ops/LogViewer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LogsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // In a real app, we'd debounce this
    const { data: logs, isLoading } = useQuery({
        queryKey: ['logs', searchTerm],
        queryFn: () => opsService.getLogs(searchTerm),
        refetchInterval: 3000 // Poll for new logs
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/ops" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
            </div>

            <LogViewer logs={logs} isLoading={isLoading} onSearch={setSearchTerm} />
        </div>
    );
}
