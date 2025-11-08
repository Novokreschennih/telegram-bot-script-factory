import React from 'react';
import { MagicIcon } from './icons/MagicIcon';

const FeatureCard: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 text-center animate-fadeIn">
      <header className="mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Создайте Уникального Telegram-Бота
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
          Превратите любую идею или существующий сценарий в полноценного, брендированного чат-бота с помощью искусственного интеллекта.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        <FeatureCard 
          title="Кастомизация"
          description="Загрузите свой сценарий (n8n, .txt, .md), и ИИ адаптирует его под любой стиль, аудиторию и цель."
        />
        <FeatureCard 
          title="Создание с нуля"
          description="Опишите идею, и наш ИИ напишет полный, структурированный сценарий диалога для вашего бота."
        />
        <FeatureCard 
          title="Полный брендинг"
          description="Получите не только текст, но и описание для профиля, список функций и промпты для генерации аватара и иллюстраций."
        />
      </div>

      <button
        onClick={onStart}
        className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl py-4 px-10 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
      >
        <MagicIcon />
        Начать работу
      </button>
    </div>
  );
};

export default LandingPage;