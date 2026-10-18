import { createContext, useCallback, useContext, useRef, useState } from "react";

const TOAST_DURATION_MS = 2200;
const ToastContext = createContext(() => {});

/** Shows the small pill message at the bottom of the screen. */
export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef(null);

  const showToast = useCallback((nextMessage) => {
    setMessage(nextMessage);
    setIsVisible(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIsVisible(false), TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast${isVisible ? " show" : ""}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
