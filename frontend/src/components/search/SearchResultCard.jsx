import React from 'react';
import { FileText, Newspaper, FileCheck, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export function SearchResultCard({ result }) {
    const navigate = useNavigate();
    const { title, snippet, score, tags, type, date, metadata } = result;

    const handleNavigate = (e) => {
        e.preventDefault();

        if (metadata?.report_url) {
            navigate(metadata.report_url);
        } else if (type === 'molecule') {
            // If we had ID, we could go to specific molecule, but usually just molecules list for now
            navigate('/molecules');
        } else if (type === 'report') {
            navigate('/reports');
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'patent': return <FileCheck className="w-5 h-5 text-amber-600" />;
            case 'trial': return <Newspaper className="w-5 h-5 text-emerald-600" />;
            case 'report': return <FileText className="w-5 h-5 text-purple-600" />;
            default: return <FileText className="w-5 h-5 text-blue-600" />;
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'patent': return "bg-amber-50 text-amber-700 border-amber-100";
            case 'trial': return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case 'report': return "bg-purple-50 text-purple-700 border-purple-100";
            default: return "bg-blue-50 text-blue-700 border-blue-100";
        }
    };

    const displayScore = Math.min((score || 0) * 100, 100).toFixed(0);

    return (
        <div onClick={handleNavigate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] hover:border-indigo-300 transition-all duration-300 group cursor-pointer relative overflow-hidden">
            {/* Dynamic Type Gradient Top Border */}
            <div className={clsx(
                "absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity",
                type === 'molecule' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                    type === 'report' ? 'bg-gradient-to-r from-purple-400 to-fuchsia-500' :
                        'bg-gradient-to-r from-emerald-400 to-teal-500'
            )} />

            <div className="flex justify-between items-start gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <span className={clsx("px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border", getTypeColor())}>
                            {getIcon()} {type}
                        </span>
                        {date && <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span> {new Date(date).toLocaleDateString()}</span>}
                    </div>

                    <a href="#" className="inline-flex items-center gap-2 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {title}
                        <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </a>

                    <p
                        className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: snippet }}
                    />

                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg text-xs font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex flex-col items-end bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        <div className="flex items-baseline gap-1">
                            <span className={clsx(
                                "text-2xl font-black tracking-tighter",
                                displayScore > 85 ? "text-emerald-500" :
                                    displayScore > 60 ? "text-indigo-500" : "text-amber-500"
                            )}>{displayScore}</span>
                            <span className="text-sm font-bold text-slate-400">%</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Relevance</span>
                    </div>

                    {/* Access Content Button */}
                    <button className="flex items-center gap-1.5 px-4 py-2 mt-2 text-sm font-semibold text-white bg-slate-800 hover:bg-indigo-600 rounded-xl transition-colors opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 duration-300">
                        View {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                </div>
            </div>
        </div>
    );
}
