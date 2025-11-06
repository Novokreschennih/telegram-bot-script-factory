import React, { useState, useCallback } from 'react';
import { generateBotAssets } from './services/geminiService';
import type { GeneratedAssets, ScriptBlockImage } from './types';
import { WRITING_STYLES, TARGET_AUDIENCES, BOT_GOALS, FORMALITY_LEVELS, EMOJI_FREQUENCIES, RESPONSE_LENGTHS, LANGUAGE_COMPLEXITIES } from './constants';
import FileUpload from './components/FileUpload';
import TextAreaInput from './components/TextAreaInput';
import SelectInput from './components/SelectInput';
import GeneratedAssetsComponent from './components/GeneratedAssets';
import LoadingSpinner from './components/LoadingSpinner';
import { MagicIcon } from './components/icons/MagicIcon';

const App: React.FC = () => {
  const [referenceScript, setReferenceScript] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [userStory, setUserStory] = useState<string>('');
  const [writingStyle, setWritingStyle] = useState<string>(WRITING_STYLES[0].value);
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0].value);
  const [botGoal, setBotGoal] = useState<string>(BOT_GOALS[0].value);
  const [formality, setFormality] = useState<string>(FORMALITY_LEVELS[0].value);
  const [emojiFrequency, setEmojiFrequency] = useState<string>(EMOJI_FREQUENCIES[0].value);
  const [responseLength, setResponseLength] = useState<string>(RESPONSE_LENGTHS[0].value);
  const [languageComplexity, setLanguageComplexity] = useState<string>(LANGUAGE_COMPLEXITIES[0].value);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAssets | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setReferenceScript(text);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!referenceScript) {
      setError('Пожалуйста, сначала загрузите референсный сценарий.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedAssets(null);

    try {
      setLoadingMessage('Создание персонажа и сценария для бота...');
      const assets = await generateBotAssets(
        referenceScript,
        userStory,
        writingStyle,
        targetAudience,
        botGoal,
        formality,
        emojiFrequency,
        responseLength,
        languageComplexity,
        (message: string) => setLoadingMessage(message)
      );
      setGeneratedAssets(assets);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [referenceScript, userStory, writingStyle, targetAudience, botGoal, formality, emojiFrequency, responseLength, languageComplexity]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Кастомизатор сценариев для Telegram-бота
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Загрузите сценарий вашего бота, добавьте свою историю, и ИИ сгенерирует полный пакет брендинга и контента.
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 md:p-8 space-y-8">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <FileUpload onFileChange={handleFileChange} fileName={fileName} />
               <TextAreaInput
                id="user-story"
                label="Добавьте вашу историю (необязательно)"
                placeholder="Например, наша компания продает экологически чистые кофейные зерна из небольших ферм в Колумбии..."
                value={userStory}
                onChange={(e) => setUserStory(e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Настройте голос вашего бота</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectInput 
                        id="writing-style"
                        label="Стиль написания"
                        value={writingStyle}
                        onChange={(e) => setWritingStyle(e.target.value)}
                        options={WRITING_STYLES}
                    />
                    <SelectInput 
                        id="target-audience"
                        label="Целевая аудитория"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        options={TARGET_AUDIENCES}
                    />
                    <SelectInput 
                        id="bot-goal"
                        label="Основная цель"
                        value={botGoal}
                        onChange={(e) => setBotGoal(e.target.value)}
                        options={BOT_GOALS}
                    />
                     <SelectInput 
                        id="formality"
                        label="Формальность"
                        value={formality}
                        onChange={(e) => setFormality(e.target.value)}
                        options={FORMALITY_LEVELS}
                    />
                     <SelectInput 
                        id="emoji-frequency"
                        label="Частота эмодзи"
                        value={emojiFrequency}
                        onChange={(e) => setEmojiFrequency(e.target.value)}
                        options={EMOJI_FREQUENCIES}
                    />
                     <SelectInput 
                        id="response-length"
                        label="Длина ответов"
                        value={responseLength}
                        onChange={(e) => setResponseLength(e.target.value)}
                        options={RESPONSE_LENGTHS}
                    />
                     <SelectInput 
                        id="language-complexity"
                        label="Сложность языка"
                        value={languageComplexity}
                        onChange={(e) => setLanguageComplexity(e.target.value)}
                        options={LANGUAGE_COMPLEXITIES}
                    />
                </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="pt-4 border-t border-gray-700">
             <button
              onClick={handleGenerate}
              disabled={isLoading || !referenceScript}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Генерация...</span>
                </>
              ) : (
                <>
                  <MagicIcon />
                  <span>Сгенерировать</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="text-center mt-10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="max-w-4xl mx-auto mt-8 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Ой! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {/* Results Section */}
        {generatedAssets && (
          <div className="mt-12">
            <GeneratedAssetsComponent assets={generatedAssets} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;