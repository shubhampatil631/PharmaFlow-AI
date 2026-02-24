import React from 'react';
import { Check, Flag, MessageSquare } from 'lucide-react';

export function FeedbackButtons({ onAccept, onFlag, onAddNote, status }) {
    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
                onClick={onAccept}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
            >
                <Check className="w-4 h-4" />
                Accept
            </button>
            <button
                onClick={onFlag}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
            >
                <Flag className="w-4 h-4" />
                Flag Incorrect
            </button>
            <button
                onClick={onAddNote}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
            >
                <MessageSquare className="w-4 h-4" />
                Add Note
            </button>
        </div>
    );
}
