import React from 'react';
import { downloadReportPdf } from '../../utils/pdfGenerator';
import { Download, MonitorPlay, Printer } from 'lucide-react';

export function ReportPreview({ report }) {
    if (!report) return null;

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 text-sm truncate max-w-md">{report.name}</h3>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Print">
                        <Printer className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <MonitorPlay className="w-3.5 h-3.5" />
                        Export PPTX
                    </button>
                    <button
                        onClick={() => downloadReportPdf(report.taskId, `${report.name}.pdf`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex justify-center">
                <div className="w-full max-w-3xl bg-white shadow-xl h-[800px] rounded-sm relative">
                    {report.fileUrl ? (
                        <iframe
                            src={report.fileUrl}
                            className="w-full h-full"
                            title="Report Preview"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                            Loading preview...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
