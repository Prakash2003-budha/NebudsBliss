import React from "react";
import shared from "./admin.shared.module.scss";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={shared.confirmOverlay} onClick={loading ? undefined : onClose}>
      <div className={shared.confirmModal} onClick={(e) => e.stopPropagation()}>
        <div className={shared.modalBody}>
          <div className={shared.confirmIcon}>!</div>
          <h3 className={shared.confirmTitle}>{title}</h3>
          <p className={shared.confirmText}>{message}</p>
          <div className={shared.confirmActions}>
            <button
              className={`${shared.btn} ${shared.btnNeutral}`}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className={`${shared.btn} ${shared.btnDanger}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
