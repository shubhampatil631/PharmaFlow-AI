import React from 'react';
import { FileText, Tag, Calendar, Info, Cpu } from 'lucide-react';

export function DocumentPreview({ document }) {
    if (!document) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <FileText size={18} />
                        Document Content
                    </div>
                    {document.ocr_applied && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold uppercase tracking-wider">
                            <Cpu size={12} />
                            AI-OCR Applied
                        </div>
                    )}
                </div>
                <div className="p-6 overflow-y-auto flex-1 font-serif text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {document.parsed_content && document.parsed_content.trim() ? (
                        document.parsed_content
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 text-center">
                            <div className="p-4 bg-slate-50 rounded-full">
                                <FileText size={48} className="opacity-20" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-600">No searchable text found</p>
                                <p className="text-xs max-w-xs mt-1">This may be a scanned image or an unsupported PDF format. OCR is required for such documents.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Metadata */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                <section className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Info size={18} /> Metadata
                    </h3>
                    <dl className="space-y-3 text-sm">
                        <div>
                            <dt className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Source</dt>
                            <dd className="font-medium">{document.source}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Date Ingested</dt>
                            <dd className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400" />
                                {new Date(document.created_at || Date.now()).toLocaleDateString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Original File</dt>
                            <dd className="truncate text-blue-600 cursor-pointer hover:underline" title={document.filename}>
                                {document.filename || 'N/A'}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="bg-white p-5 rounded-xl border shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Tag size={18} /> Extracted Entities
                    </h3>
                    {document.entities?.length ? (
                        <div className="flex flex-wrap gap-2">
                            {document.entities.map((entity, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-100">
                                    {entity}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No entities extracted yet.</p>
                    )}
                </section>

                <section className="bg-slate-900 text-white p-5 rounded-xl shadow-sm">
                    <h3 className="font-medium mb-2">Embeddings Status</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                        Generated & Indexed
                    </div>
                </section>
            </div>
        </div>
    );
}
