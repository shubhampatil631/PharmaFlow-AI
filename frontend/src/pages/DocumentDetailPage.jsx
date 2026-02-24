import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ingestionService } from '../services/ingestionService';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { DocumentPreview } from '../components/ingestion/DocumentPreview';

export function DocumentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: document, isLoading } = useQuery({
        queryKey: ['document', id],
        queryFn: () => ingestionService.getDocumentById(id)
    });

    const handleChatClick = () => {
        navigate(`/chat?doc_id=${id}&title=${encodeURIComponent(document?.title || 'Document')}`);
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading document...</div>;
    if (!document) return <div className="p-8 text-center text-red-500">Document not found</div>;

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-4">
                <Link to="/ingestion/documents" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <div className="mb-6 flex items-start justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{document.title}</h1>
                        <p className="text-slate-500 font-mono text-sm">ID: {document._id}</p>
                    </div>
                    <button
                        onClick={handleChatClick}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        <MessageSquare size={18} />
                        Chat with Document
                    </button>
                </div>
            </div>

            <DocumentPreview document={document} />
        </div>
    );
}

export default DocumentDetailPage;
