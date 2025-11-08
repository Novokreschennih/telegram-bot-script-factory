import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => {
  // Prevent clicks inside the modal from closing it
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={handleModalContentClick}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
            >
                <CloseIcon />
            </button>
        </header>
        <div className="p-6 overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;