import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ingestionService } from '../../services/ingestionService';
import { toast } from 'sonner';
import { Upload, FileText, X } from 'lucide-react';

export function UploadDocumentModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setTitle(selected.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('source', 'Internal Upload');

        try {
            await ingestionService.uploadDocument(formData);
            toast.success('Document uploaded successfully');
            if (onSuccess) onSuccess();
            onClose();
            setFile(null);
            setTitle('');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Document">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative"
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {file ? (
                        <div className="flex flex-col items-center text-blue-600">
                            <FileText size={48} className="mb-2" />
                            <span className="font-medium text-slate-900">{file.name}</span>
                            <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(''); }}
                                className="mt-2 text-xs text-red-500 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-50 p-3 rounded-full text-blue-500 mb-3">
                                <Upload size={24} />
                            </div>
                            <p className="font-medium text-slate-700">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500 mt-1">PDF, DOCX or TXT (max 10MB)</p>
                        </>
                    )}
                </div>

                {file && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                        disabled={loading || !file}
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
