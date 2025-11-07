import React from 'react';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-500/10">
      <h2 className="text-2xl font-bold text-white mb-4">Требуется API-ключ Gemini</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        Чтобы использовать это приложение, вам необходимо выбрать API-ключ Gemini. Использование API может повлечь за собой расходы.
      </p>
      <button
        onClick={onSelectKey}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
      >
        Выбрать API-ключ
      </button>
      <p className="mt-4 text-sm text-gray-500">
        Узнайте больше о{' '}
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          тарифах и биллинге
        </a>.
      </p>
    </div>
  );
};

export default ApiKeySelector;
