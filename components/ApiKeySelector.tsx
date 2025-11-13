import React, { useState, useEffect } from 'react';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey }) => {
  const [isAistudioAvailable, setIsAistudioAvailable] = useState(false);

  useEffect(() => {
    // Check for aistudio on mount
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setIsAistudioAvailable(true);
    }
  }, []);

  if (isAistudioAvailable) {
    // Original component for supported environments
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-500/10">
        <h2 className="text-2xl font-bold text-white mb-4">Требуется API-ключ Gemini</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Чтобы использовать это приложение, вам необходимо выбрать API-ключ Gemini. Использование API может повлечь за собой расходы.
          <br/><br/>
          <span className="font-semibold text-gray-300">Ваш ключ обрабатывается безопасно в браузере и никогда не передается на наши серверы.</span>
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
  }

  // Fallback component for unsupported environments
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-2xl shadow-2xl shadow-red-500/10">
      <h2 className="text-2xl font-bold text-white mb-4">Неподдерживаемая среда</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        Это приложение разработано для работы в специализированных средах (например, Google AI Studio), где выбор API-ключа происходит через безопасный системный диалог.
      </p>
      <div className="text-yellow-300 bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 w-full">
        <p className="font-bold">Ваш браузер не поддерживает этот механизм.</p>
        <p className="mt-2 text-sm text-yellow-400">
            В целях безопасности ручной ввод API-ключа не предусмотрен. Пожалуйста, откройте приложение в поддерживаемой среде для его использования.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;
