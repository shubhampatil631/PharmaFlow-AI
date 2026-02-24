import { Modal } from './Modal';
import clsx from 'clsx';

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <p className="text-slate-600">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium text-white rounded-md transition-colors",
                            isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-sky-600 hover:bg-sky-700"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
