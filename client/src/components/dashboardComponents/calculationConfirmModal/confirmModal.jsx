import React from 'react';
import { CloseIcon, WarningIcon } from '../../icons/index';
import './style.css';

const ConfirmModal = ({ 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm,
  onCancel,
  danger = false
}) => {
  return (
    <div className="modal-overlay">
      <div className={`confirm-modal ${danger ? 'danger' : ''}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onCancel}>
            <CloseIcon className="close-icon" />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-icon">
            <WarningIcon className="warning-icon" />
          </div>
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          <button className="secondary-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`primary-btn ${danger ? 'danger-btn' : ''}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;