import { useEffect, useRef } from "react";

/**
 * Native <dialog> controlled by the isOpen prop.
 * Clicking the dark backdrop or pressing Escape calls onClose.
 */
export function Modal({ isOpen, onClose, labelledBy, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;
    if (isOpen && !dialogElement.open) dialogElement.showModal();
    if (!isOpen && dialogElement.open) dialogElement.close();
  }, [isOpen]);

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }

  return (
    <dialog ref={dialogRef} aria-labelledby={labelledBy} onClick={handleBackdropClick} onCancel={handleCancel}>
      {children}
    </dialog>
  );
}
