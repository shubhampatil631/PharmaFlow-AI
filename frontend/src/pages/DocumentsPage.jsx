import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ingestionService } from '../services/ingestionService';
import { SearchBar } from '../components/molecules/SearchBar';
import { DataTable } from '../components/ui/DataTable';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Eye, FileText, Trash2, Link as LinkIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { UploadDocumentModal } from '../components/ingestion/UploadDocumentModal';

export function DocumentsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check if we should open upload modal initially (e.g. if navigated from dashboard)
    // Check if we should open upload modal initially (e.g. if navigated from dashboard)
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('documents'); // 'documents' or 'connectors'

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await ingestionService.deleteDocument(id);
                refetch();
            } catch (e) {
                console.error("Delete failed", e);
                alert("Failed to delete document");
            }
        }
    };

    const queryParams = {
        page,
        size: 10,
        q: search
    };

    const { data: documentsData, isLoading: loadingDocs, refetch } = useQuery({
        queryKey: ['documents', queryParams],
        queryFn: () => ingestionService.getDocuments(queryParams),
        placeholderData: (prev) => prev
    });

    const { data: connectors, isLoading: loadingConnectors } = useQuery({
        queryKey: ['connectors'],
        queryFn: ingestionService.getConnectors,
    });

    const isLoading = loadingDocs; // Keep original variable for table loading state

    const columns = [
        { header: 'Title', accessor: 'title', className: 'font-medium text-slate-900' },
        { header: 'Source', accessor: 'source' },
        {
            header: 'Ingested Date',
            accessor: (item) => new Date(item.created_at || Date.now()).toLocaleDateString()
        },
        {
            header: 'Status',
            accessor: (item) => (
                <span className={`px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600`}>
                    {item.status || 'Processed'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item) => (
                <div className="flex items-center gap-2">
                    <Link
                        to={`/ingestion/documents/${item._id}`}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="View Document"
                    >
                        <Eye size={16} />
                    </Link>
                    <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600 transition-colors"
                        title="Delete Document"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const queryClient = useQueryClient();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Ingestion & Connectors</h1>
                    <p className="text-slate-500 mt-1">Manage documents and external API connections.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'documents' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Documents
                        </button>
                        <button
                            onClick={() => setActiveTab('connectors')}
                            className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'connectors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Connectors
                        </button>
                    </div>
                    {activeTab === 'documents' && (
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-medium"
                        >
                            Upload Document
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'documents' ? (
                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
                    {/* Main Content: Table */}
                    <div className="lg:col-span-3 space-y-4">
                        <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." />

                        <DataTable
                            data={documentsData?.items || []}
                            isLoading={isLoading}
                            columns={columns}
                            pagination={{
                                total: documentsData?.total || 0,
                                page: page,
                                size: 10
                            }}
                            onPageChange={setPage}
                        />
                    </div>

                    {/* Context Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <FileText size={18} className="text-slate-400" />
                                Collection Insights
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Total Indexed</span>
                                        <span className="font-medium text-slate-900">{documentsData?.total || 0}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-slate-200 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Documents are automatically parsed for <strong>Entities</strong> (genes, proteins) and <strong>Relationships</strong>.
                                    Quality confidence scores are assigned post-OCR.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Supported Formats</h4>
                            <div className="flex flex-wrap gap-2">
                                {['PDF', 'DOCX', 'TXT', 'HTML'].map(fmt => (
                                    <span key={fmt} className="px-2 py-1 bg-white rounded text-xs font-medium text-blue-600 border border-blue-100">
                                        {fmt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {connectors && connectors.length > 0 ? (
                        connectors.map((conn) => (
                            <div key={conn._id || conn.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <LinkIcon className="text-slate-500" size={24} />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize flex items-center gap-1 ${conn.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-50 text-slate-700 border border-slate-100'
                                        }`}>
                                        {conn.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                        {conn.status || 'unknown'}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{conn.name}</h3>
                                <p className="text-sm text-slate-500 mb-4">{conn.type || 'Connector'}</p>
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">{conn.description || 'No description available.'}</p>

                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-xs text-slate-400 font-mono">API v1.0</span>
                                    <div className="flex gap-3">
                                        <button className="text-sm font-medium text-slate-500 hover:text-slate-700">Configure</button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await ingestionService.runConnector(conn._id || conn.id);
                                                    alert(`Connector ${conn.name} sync started!`);
                                                } catch (e) {
                                                    alert("Failed to start sync");
                                                }
                                            }}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                            Sync Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <LinkIcon className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No Active Connectors</h3>
                            <p className="text-slate-500 mt-1">Configure data sources in the Ingestion Dashboard.</p>
                            <Link to="/ingestion" className="mt-4 inline-flex items-center text-blue-600 font-medium hover:underline">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <UploadDocumentModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['documents'] })}
            />
        </div>
    );
}
export default DocumentsPage;
