import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { moleculeService } from '../../services/moleculeService';
import { toast } from 'sonner';

export function RequestEvalDialog({ isOpen, onClose, moleculeId, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [depth, setDepth] = useState('full');
    const [notes, setNotes] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await moleculeService.requestEvaluation(moleculeId, { depth, notes });
            toast.success('Evaluation started');
            onClose();
            if (response.task_id) {
                navigate(`/agents/tasks/${response.task_id}`);
            } else if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to request evaluation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Evaluation">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-500">
                    This will trigger the multi-agent workflow to evaluate the molecule for repurposing candidates.
                </p>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Evaluation Depth</label>
                    <select
                        value={depth}
                        onChange={e => setDepth(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="quick">Quick Scan (Literature only)</option>
                        <option value="full">Full Analysis (Literature + Mechanism + Patents)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                    <textarea
                        placeholder="Any specific indications or mechanisms to focus on..."
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
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
                        className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Requesting...' : 'Start Evaluation'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
