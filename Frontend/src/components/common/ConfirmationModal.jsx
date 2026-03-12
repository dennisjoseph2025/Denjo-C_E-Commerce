import React from 'react';

const ConfirmationModal = ({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'danger' 
}) => {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header/Icon */}
                <div className={`h-2 ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`} />
                
                <div className="p-8">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shrink-0 ${isDanger ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {isDanger ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed uppercase tracking-wider font-medium">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row-reverse items-stretch gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                                onCancel();
                            }}
                            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 ${
                                isDanger 
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/20' 
                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                            }`}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
