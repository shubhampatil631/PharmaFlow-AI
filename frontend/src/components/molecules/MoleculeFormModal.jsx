import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { moleculeService } from '../../services/moleculeService';
import { toast } from 'sonner';

export function MoleculeFormModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        cas_number: '',
        synonyms: '',
        indication: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await moleculeService.createMolecule({
                ...formData,
                synonyms: formData.synonyms.split(',').map(s => s.trim()).filter(Boolean)
            });
            toast.success('Molecule created successfully');
            if (onSuccess) onSuccess();
            onClose();
            setFormData({ name: '', cas_number: '', synonyms: '', indication: '', description: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to create molecule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Molecule">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                        required
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CAS Number <span className="text-slate-400 font-normal">(Optional - Auto-fetched if empty)</span></label>
                    <input
                        type="text"
                        placeholder="e.g. 50-00-0"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.cas_number}
                        onChange={e => setFormData({ ...formData, cas_number: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Synonyms (comma separated)</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.synonyms}
                        onChange={e => setFormData({ ...formData, synonyms: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Indication (Therapeutic Area)</label>
                    <input
                        type="text"
                        placeholder="e.g. Oncology, Rare Diseases"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.indication}
                        onChange={e => setFormData({ ...formData, indication: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Molecule'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
