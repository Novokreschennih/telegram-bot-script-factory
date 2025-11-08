import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { QuestionIcon } from './icons/QuestionIcon';

interface FloatingIconsProps {
  onSettingsClick: () => void;
  onInstructionsClick: () => void;
}

const FloatingIcons: React.FC<FloatingIconsProps> = ({ onSettingsClick, onInstructionsClick }) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
      <button 
        onClick={onInstructionsClick}
        className="bg-gray-700 hover:bg-purple-600 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-110"
        aria-label="Инструкция"
        title="Инструкция"
      >
        <QuestionIcon />
      </button>
      <button 
        onClick={onSettingsClick}
        className="bg-gray-700 hover:bg-purple-600 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-110"
        aria-label="Настройки"
        title="Настройки"
      >
        <SettingsIcon />
      </button>
    </div>
  );
};

export default FloatingIcons;