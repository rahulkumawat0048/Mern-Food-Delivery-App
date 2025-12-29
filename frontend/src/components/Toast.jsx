import React, { useEffect } from "react";

const Toast = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-5 right-5 w-[280px] bg-white shadow-lg border-l-4 border-[#ff4d2d] rounded-lg overflow-hidden z-50 animate-fadeIn">
      <div className="px-4 py-3 flex justify-between items-center">
        <span className="text-gray-800 font-medium">{message}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">
          ×
        </button>
      </div>
      {/* Animated line */}
      <div className="h-1 bg-[#ff4d2d] animate-toastLine"></div>
    </div>
  );
};

export default Toast;
