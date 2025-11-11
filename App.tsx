
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generateBotAssets, regenerateSingleMessage } from './services/geminiService';
import type { GeneratedAssets } from './types';
import { WRITING_STYLES, TARGET_AUDIENCES, BOT_GOALS, FORMALITY_LEVELS, EMOJI_FREQUENCIES, RESPONSE_LENGTHS, LANGUAGE_COMPLEXITIES, SALES_FRAMEWORKS } from './constants';
import FileUpload from './components/FileUpload';
import TextAreaInput from './components/TextAreaInput';
import SelectInput from './components/SelectInput';
import GeneratedAssetsComponent from './components/GeneratedAssets';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeySelector from './components/ApiKeySelector';
import { MagicIcon } from './components/icons/MagicIcon';
import LandingPage from './components/LandingPage';
import FloatingIcons from './components/FloatingIcons';
import Modal from './components/Modal';
import InstructionsModal from './components/InstructionsModal';
import PinValidation from './components/PinValidation';
import LegalContent from './components/LegalContent';
import GeneratedAssetsSkeleton from './components/GeneratedAssetsSkeleton';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const APP_STATE_STORAGE_KEY = 'botCustomizerState';
const API_KEY_SELECTED_FLAG = 'apiKeySelected';
const AUTH_STATUS_KEY = 'isAuthenticated';

type AppMode = 'customize' | 'create';
type AppView = 'landing' | 'pin' | 'app';

interface AppState {
    mainInputText: string;
    fileName: string;
    userStory: string;
    writingStyle: string;
    targetAudience: string;
    botGoal: string;
    formality: string;
    emojiFrequency: string;
    responseLength: string;
    languageComplexity: string;
    salesFramework: string;
    mode: AppMode;
}

const getInitialView = (): AppView => {
    if (typeof window !== 'undefined' && localStorage.getItem(AUTH_STATUS_KEY) === 'true') {
        return 'app';
    }
    return 'landing';
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(getInitialView());
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);

  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);
  
  const [mode, setMode] = useState<AppMode>('customize');
  const [mainInputText, setMainInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [userStory, setUserStory] = useState<string>('');
  const [writingStyle, setWritingStyle] = useState<string>(WRITING_STYLES[0].value);
  const [targetAudience, setTargetAudience] = useState<string>(TARGET_AUDIENCES[0].value);
  const [botGoal, setBotGoal] = useState<string>(BOT_GOALS[0].value);
  const [formality, setFormality] = useState<string>(FORMALITY_LEVELS[0].value);
  const [emojiFrequency, setEmojiFrequency] = useState<string>(EMOJI_FREQUENCIES[0].value);
  const [responseLength, setResponseLength] = useState<string>(RESPONSE_LENGTHS[0].value);
  const [languageComplexity, setLanguageComplexity] = useState<string>(LANGUAGE_COMPLEXITIES[0].value);
  const [salesFramework, setSalesFramework] = useState<string>(SALES_FRAMEWORKS[0].value);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState<boolean>(false);
  const [regeneratingMessageIndex, setRegeneratingMessageIndex] = useState<number | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAssets | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(APP_STATE_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState: AppState = JSON.parse(savedStateJSON);
        setMainInputText(savedState.mainInputText || '');
        setFileName(savedState.fileName || '');
        setUserStory(savedState.userStory || '');
        setWritingStyle(savedState.writingStyle || WRITING_STYLES[0].value);
        setTargetAudience(savedState.targetAudience || TARGET_AUDIENCES[0].value);
        setBotGoal(savedState.botGoal || BOT_GOALS[0].value);
        setFormality(savedState.formality || FORMALITY_LEVELS[0].value);
        setEmojiFrequency(savedState.emojiFrequency || EMOJI_FREQUENCIES[0].value);
        setResponseLength(savedState.responseLength || RESPONSE_LENGTHS[0].value);
        setLanguageComplexity(savedState.languageComplexity || LANGUAGE_COMPLEXITIES[0].value);
        setSalesFramework(savedState.salesFramework || SALES_FRAMEWORKS[0].value);
        setMode(savedState.mode || 'customize');
      }
    } catch (e) {
      console.error("Failed to parse state from localStorage", e);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const appState: AppState = {
      mainInputText,
      fileName,
      userStory,
      writingStyle,
      targetAudience,
      botGoal,
      formality,
      emojiFrequency,
      responseLength,
      languageComplexity,
      salesFramework,
      mode,
    };
    localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(appState));
  }, [
    mainInputText, fileName, userStory, writingStyle, targetAudience,
    botGoal, formality, emojiFrequency, responseLength, languageComplexity, salesFramework, mode
  ]);


  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeySelected(hasKey);
        if (hasKey) {
          localStorage.setItem(API_KEY_SELECTED_FLAG, 'true');
        } else {
          localStorage.removeItem(API_KEY_SELECTED_FLAG);
        }
      } else if (localStorage.getItem(API_KEY_SELECTED_FLAG)) {
        setIsApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);
  
  const handleModeChange = (newMode: AppMode) => {
    if (mode === newMode) return;

    setMode(newMode);
    // Reset state related to a specific mode's input
    setMainInputText('');
    setFileName('');
    setUserStory('');
    setError(null);
    setGeneratedAssets(null);
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsApiKeySelected(true);
      localStorage.setItem(API_KEY_SELECTED_FLAG, 'true');
      setSettingsModalOpen(false); // Close modal on success
    }
  };
  
  const processFileContent = (file: File, text: string) => {
    setFileName(file.name);
    if (mode === 'customize' && file.name.endsWith('.json')) {
      try {
        const parsedJson = JSON.parse(text);
        if (parsedJson.nodes && Array.isArray(parsedJson.nodes)) {
          const scriptText = parsedJson.nodes
            .map((node: any) => node?.parameters?.text)
            .filter(Boolean)
            .join('\n\n---\n\n');
          if (scriptText) {
            setMainInputText(scriptText);
          } else {
             setMainInputText('Не удалось извлечь текст из n8n JSON. Используется содержимое файла как текст.');
             setError('Не удалось найти текстовые узлы в файле n8n. Сценарий будет обработан как обычный текст.');
          }
        } else {
          setMainInputText(JSON.stringify(parsedJson, null, 2));
        }
      } catch (error) {
        console.error("Failed to parse JSON file, treating as text.", error);
        setMainInputText(text);
        setError('Не удалось прочитать JSON файл. Он будет обработан как обычный текст.');
      }
    } else {
      setMainInputText(text);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if(mode === 'customize') {
          processFileContent(file, text);
        } else {
          setMainInputText(prev => prev ? `${prev}\n\n--- (содержимое файла ${file.name}) ---\n\n${text}` : text);
          setFileName(prev => prev ? `${prev}, ${file.name}`: file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!isApiKeySelected) {
      setError("Пожалуйста, выберите API-ключ в настройках, чтобы начать генерацию.");
      setSettingsModalOpen(true);
      return;
    }
    if (!mainInputText) {
      setError(mode === 'customize' ? 'Пожалуйста, сначала загрузите референсный сценарий.' : 'Пожалуйста, опишите идею вашего бота.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedAssets(null);
    setRegeneratingMessageIndex(null);
    setIsRegeneratingAll(false);

    try {
      const assets = await generateBotAssets(
        mode,
        mainInputText,
        userStory,
        writingStyle,
        targetAudience,
        botGoal,
        formality,
        emojiFrequency,
        responseLength,
        languageComplexity,
        salesFramework
      );
      setGeneratedAssets(assets);
    } catch (err) {
      console.error("Generation failed:", err);
      let errorMessage = 'Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз или проверьте консоль разработчика для получения дополнительной информации.';
       
      if (err instanceof Error) {
        if (err.message.includes('Requested entity was not found.')) {
            errorMessage = 'Ваш API-ключ недействителен или не имеет доступа к необходимым моделям. Пожалуйста, выберите другой ключ и попробуйте снова.';
            setIsApiKeySelected(false);
            localStorage.removeItem(API_KEY_SELECTED_FLAG);
        } else if (err.message.includes('The model is overloaded') || err.message.includes('UNAVAILABLE')) {
            errorMessage = 'Модель искусственного интеллекта в данный момент перегружена из-за высокого спроса. Пожалуйста, подождите немного и попробуйте снова.';
        } else if (err instanceof SyntaxError || err.message.toLowerCase().includes('json')) {
            errorMessage = 'Ошибка обработки ответа ИИ. Модель вернула данные в неверном формате. Это может произойти со сложными сценариями. Попробуйте упростить запрос или изменить настройки.';
        } else if (err.message.toLowerCase().includes('block') && err.message.toLowerCase().includes('safety')) {
             errorMessage = 'Ответ был заблокирован из-за настроек безопасности. Пожалуйста, измените свой запрос.';
        } else {
            errorMessage = `Произошла ошибка: ${err.message}`;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isApiKeySelected, mode, mainInputText, userStory, writingStyle, targetAudience, botGoal, formality, emojiFrequency, responseLength, languageComplexity, salesFramework]);

  const handleRegenerateAll = useCallback(async () => {
    setIsRegeneratingAll(true);
    await handleGenerate();
    setIsRegeneratingAll(false);
  }, [handleGenerate]);

  const handleRegenerateSingleMessage = useCallback(async (index: number) => {
    if (!generatedAssets) return;
    
    setRegeneratingMessageIndex(index);
    setError(null);

    try {
        const currentScriptForContext = generatedAssets.customizedScript
            .map(node => node.text)
            .join('\n---\n');
        
        const messageToRegenerate = generatedAssets.customizedScript[index].text;

        const newText = await regenerateSingleMessage(
            { userStory, writingStyle, targetAudience, botGoal, formality, emojiFrequency, responseLength, languageComplexity, salesFramework },
            currentScriptForContext,
            messageToRegenerate
        );

        setGeneratedAssets(prevAssets => {
            if (!prevAssets) return null;
            const newScript = [...prevAssets.customizedScript];
            newScript[index] = { ...newScript[index], text: newText };
            return { ...prevAssets, customizedScript: newScript };
        });

    } catch (err) {
        console.error("Single message regeneration failed:", err);
        setError("Не удалось перегенерировать сообщение. Попробуйте снова.");
    } finally {
        setRegeneratingMessageIndex(null);
    }
  }, [generatedAssets, userStory, writingStyle, targetAudience, botGoal, formality, emojiFrequency, responseLength, languageComplexity, salesFramework]);

  const availableResponseLengths = useMemo(() => {
    if (mode === 'customize') {
      return RESPONSE_LENGTHS;
    }
    return RESPONSE_LENGTHS.filter(opt => opt.value !== 'As in original');
  }, [mode]);

  useEffect(() => {
    if (mode === 'create' && responseLength === 'As in original') {
      setResponseLength(RESPONSE_LENGTHS.find(opt => opt.value === 'Medium (Balanced)')?.value || RESPONSE_LENGTHS[1].value);
    } else if (mode === 'customize') {
      setResponseLength('As in original');
    }
  }, [mode]);
  
  const generateButtonTooltip = !isApiKeySelected 
    ? "Пожалуйста, выберите API-ключ в настройках" 
    : !mainInputText 
      ? (mode === 'customize' ? 'Пожалуйста, загрузите сценарий' : 'Пожалуйста, опишите идею бота')
      : 'Сгенерировать';

  const handlePinSuccess = () => {
    localStorage.setItem(AUTH_STATUS_KEY, 'true');
    setView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STATUS_KEY);
    setView('landing');
    setSettingsModalOpen(false); // Close modal on logout
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
        <main className="container mx-auto px-4 py-8 md:py-12">
            <LandingPage onStart={() => setView('pin')} />
        </main>
      </div>
    );
  }

  if (view === 'pin') {
    return <PinValidation onSuccess={handlePinSuccess} appId="app3" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <>
            <header className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Кастомизатор сценариев для Telegram-бота
              </h1>
              <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Адаптируйте существующий сценарий или создайте новый с нуля. Загрузите текст, добавьте детали, и ИИ сгенерирует полный пакет брендинга и контента.
              </p>
            </header>
            
            <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-2xl shadow-purple-500/10 p-6 md:p-8 space-y-8">
              
              <div className="flex justify-center border-b border-gray-700">
                <button 
                  onClick={() => handleModeChange('customize')}
                  className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${mode === 'customize' ? 'border-b-2 border-purple-400 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Кастомизация
                </button>
                <button 
                  onClick={() => handleModeChange('create')}
                  className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${mode === 'create' ? 'border-b-2 border-purple-400 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Создание с нуля
                </button>
              </div>

              {/* Inputs Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   {mode === 'customize' ? (
                     <>
                       <FileUpload onFileChange={handleFileChange} fileName={fileName} label="Загрузите референсный сценарий" />
                       <TextAreaInput
                        id="user-story"
                        label="Добавьте вашу историю (необязательно)"
                        placeholder="Например, наша компания продает экологически чистые кофейные зерна..."
                        value={userStory}
                        onChange={(e) => setUserStory(e.target.value)}
                        rows={5}
                      />
                     </>
                   ) : (
                     <>
                       <TextAreaInput
                        id="bot-idea"
                        label="Опишите идею вашего бота"
                        placeholder="Например: бот для кофейни, который принимает заказы, рассказывает о сортах кофе и проводит викторины..."
                        value={mainInputText}
                        onChange={(e) => setMainInputText(e.target.value)}
                        rows={8}
                      />
                       <FileUpload onFileChange={handleFileChange} fileName={fileName} label="Загрузите доп. материалы (необязательно)" />
                     </>
                   )}
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
                            id="sales-framework"
                            label="Модель продаж"
                            value={salesFramework}
                            onChange={(e) => setSalesFramework(e.target.value)}
                            options={SALES_FRAMEWORKS}
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
                            options={availableResponseLengths}
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
              <div className="pt-4 border-t border-gray-700 space-y-4">
                {!isApiKeySelected && !isLoading && (
                  <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg flex items-center justify-between gap-4">
                    <span>Для генерации контента требуется API-ключ.</span>
                    <button 
                      onClick={() => setSettingsModalOpen(true)}
                      className="font-bold hover:underline whitespace-nowrap"
                    >
                      Выбрать ключ
                    </button>
                  </div>
                )}
                 <button
                  onClick={handleGenerate}
                  disabled={isLoading || !mainInputText || !isApiKeySelected}
                  title={generateButtonTooltip}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
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

            {/* Loading Skeleton */}
            {isLoading && !generatedAssets && (
                <div className="mt-12">
                    <GeneratedAssetsSkeleton />
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
                <GeneratedAssetsComponent 
                    assets={generatedAssets} 
                    onRegenerateAll={handleRegenerateAll}
                    onRegenerateSingleMessage={handleRegenerateSingleMessage}
                    isRegeneratingAll={isRegeneratingAll}
                    regeneratingMessageIndex={regeneratingMessageIndex}
                />
              </div>
            )}
        </>
      </main>

      <FloatingIcons 
        onSettingsClick={() => setSettingsModalOpen(true)}
        onInstructionsClick={() => setInstructionsModalOpen(true)}
        onPolicyClick={() => setPolicyModalOpen(true)}
      />

      {isSettingsModalOpen && (
          <Modal title="Настройки" onClose={() => setSettingsModalOpen(false)}>
              <div className="space-y-8">
                  <ApiKeySelector onSelectKey={handleSelectKey} />
                  <div className="pt-4 border-t border-gray-700">
                      <button
                          onClick={handleLogout}
                          className="w-full bg-red-800/50 hover:bg-red-700/60 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                          Выйти
                      </button>
                  </div>
              </div>
          </Modal>
      )}

      {isInstructionsModalOpen && (
          <Modal title="Как использовать приложение" onClose={() => setInstructionsModalOpen(false)}>
              <InstructionsModal />
          </Modal>
      )}

      {isPolicyModalOpen && (
          <Modal title="Политика конфиденциальности и Условия использования" onClose={() => setPolicyModalOpen(false)}>
              <LegalContent />
          </Modal>
      )}
    </div>
  );
};

export default App;