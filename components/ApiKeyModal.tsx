
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  isClosable: boolean;
  onClose?: () => void;
  currentKey?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, isClosable, onClose, currentKey }) => {
  const [localApiKey, setLocalApiKey] = useState(currentKey || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (localApiKey.trim()) {
      onSave(localApiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-gray-800 rounded-2xl shadow-2xl shadow-purple-500/20 w-full max-w-lg flex flex-col p-6 m-4">
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Настройка API-ключа Gemini</h3>
          {isClosable && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>
          )}
        </header>
        <div className="space-y-4">
          <p className="text-gray-400">
            Для работы приложения требуется API-ключ Google AI. Ваш ключ надежно хранится в локальном хранилище вашего браузера и никогда не передается на наши серверы.
          </p>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">
                Ваш API-ключ
              </label>
              <input
                id="api-key-input"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Введите ваш API-ключ Gemini"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg shadow-sm text-gray-200 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 p-2.5"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Вы можете получить ключ в{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:underline"
              >
                Google AI Studio
              </a>.
            </p>
            <button
              type="submit"
              disabled={!localApiKey.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              Сохранить и продолжить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
