// src/components/modals/Modal.tsx
import "./modal.css"

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string; // ✅ nuevo
};

export default function Modal({ open, title, onClose, actions, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="md-backdrop">
      <div className={`md-card ${className ?? ""}`}>
        <div className="md-header">
          <h3 className="md-title">{title}</h3>
          <button className="md-close" onClick={onClose}>×</button>
        </div>

        <div className="md-body">{children}</div>

        <div className="md-footer">{actions}</div>
      </div>
    </div>
  );
}
