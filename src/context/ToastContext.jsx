import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    info: (msg, dur) => addToast(msg, 'info', dur),
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background:
                t.type === 'error'
                  ? 'linear-gradient(135deg, #1f1418 0%, #2c1218 100%)'
                  : t.type === 'success'
                  ? 'linear-gradient(135deg, #10211a 0%, #153225 100%)'
                  : 'linear-gradient(135deg, #161922 0%, #1e2230 100%)',
              border: `1px solid ${
                t.type === 'error'
                  ? 'rgba(229, 9, 20, 0.5)'
                  : t.type === 'success'
                  ? 'rgba(34, 197, 94, 0.5)'
                  : 'rgba(212, 175, 55, 0.4)'
              }`,
              borderRadius: '12px',
              padding: '0.9rem 1.1rem',
              color: '#ffffff',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              animation: 'fadeIn 0.25s ease-out'
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {t.type === 'error' ? (
                <AlertCircle size={20} color="#ff4b55" />
              ) : t.type === 'success' ? (
                <CheckCircle size={20} color="#4ade80" />
              ) : (
                <Info size={20} color="#f5c518" />
              )}
            </div>
            <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: '1.4' }}>
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex'
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

