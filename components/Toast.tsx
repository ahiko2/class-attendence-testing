import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) {
    return null;
  }

  return (
    <div 
      className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down"
      role="alert"
    >
      <p>{message}</p>
    </div>
  );
};

// Add keyframes for animation in a style tag or your global CSS
const styles = `
@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}
`;

// Inject styles into the head
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}


export default Toast;
