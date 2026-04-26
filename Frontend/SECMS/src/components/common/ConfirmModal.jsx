import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-card" onClick={e => e.stopPropagation()}>
                <div className="confirm-header">
                    <div className={`confirm-icon-box ${type}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <button className="confirm-close" onClick={onCancel}><X size={18} /></button>
                </div>
                <div className="confirm-body">
                    <h3 className="confirm-title">{title}</h3>
                    <p className="confirm-message">{message}</p>
                </div>
                <div className="confirm-footer">
                    <button className="confirm-btn-secondary" onClick={onCancel}>{cancelText}</button>
                    <button className={`confirm-btn-primary ${type}`} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
