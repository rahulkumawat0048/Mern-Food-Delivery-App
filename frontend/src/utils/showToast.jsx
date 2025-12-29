// utils/showToast.js
import React from "react";
import ReactDOM from "react-dom/client";
import Toast from "../components/Toast";

export const showToast = (message, duration = 3000) => {
  // Create a new DOM container
  const container = document.createElement("div");
  document.body.appendChild(container);

  // Create a React root for this toast
  const root = ReactDOM.createRoot(container);

  // Function to remove the toast cleanly
  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  // Render the Toast
  root.render(
    <Toast message={message} duration={duration} onClose={handleClose} />
  );
};
