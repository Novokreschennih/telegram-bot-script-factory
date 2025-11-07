import React, { useMemo, useState } from 'react';
import type { GeneratedAssets } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface GeneratedAssetsProps {
  assets: GeneratedAssets;
  outputFormat: string;
}

const PromptCard: React.FC<{ title: string; prompt: string; className?: string }> = ({ title, prompt, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-gray-900/50 rounded-lg overflow-hidden group p-4 flex flex-col ${className}`}>
        <h4 className="text-sm md:text-base font-semibold text-gray-200 mb-2">{title}</h4>
        <p className="text-sm text-gray-400 font-mono flex-grow mb-4">{prompt}</p>
        <button
            onClick={handleCopy}
            className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Скопировано!' : 'Копировать промпт'}
        </button>
    </div>
  );
};

const GeneratedAssetsComponent: React.FC<GeneratedAssetsProps> = ({ assets, outputFormat }) => {
  const [scriptCopied, setScriptCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(assets.customizedScript);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };
  
  const handleDownload = () => {
    let mimeType = 'text/plain;charset=utf-8';
    let extension = 'txt';

    if (outputFormat === 'Markdown') {
        mimeType = 'text/markdown;charset=utf-8';
        extension = 'md';
    } else if (outputFormat.toLowerCase().includes('json')) {
        mimeType = 'application/json;charset=utf-8';
        extension = 'json';
    }

    const blob = new Blob([assets.customizedScript], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customized_script.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isJsonFormat = useMemo(() => outputFormat.toLowerCase().includes('json'), [outputFormat]);

  const displayScript = useMemo(() => {
    if (isJsonFormat && assets.customizedScript) {
        try {
            return JSON.stringify(JSON.parse(assets.customizedScript), null, 2);
        } catch (e) {
            console.error("Failed to parse script as JSON", e);
            return assets.customizedScript; 
        }
    }
    return assets.customizedScript;
  }, [assets.customizedScript, isJsonFormat]);


  return (
    <div className="space-y-12">
      {/* Bot Profile Section */}
      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Профиль бота
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-300 uppercase tracking-wider">Описание</h3>
              <p className="text-gray-300 mt-1">{assets.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 uppercase tracking-wider">Что умеет этот бот?</h3>
              <ul className="list-disc list-inside text-gray-300 mt-1 space-y-1">
                {assets.capabilities.split('\n').map((cap, index) => (
                  <li key={index}>{cap}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="md:col-span-2">
            <PromptCard 
              title="Промпт для изображения профиля"
              prompt={assets.profilePicturePrompt}
            />
          </div>
        </div>
      </section>

      {/* Customized Script Section */}
      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Адаптированный сценарий
            </h2>
            <div className="flex items-center gap-2">
              <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                  <DownloadIcon />
                  Скачать файл
              </button>
              <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                  {scriptCopied ? <CheckIcon /> : <CopyIcon />}
                  {scriptCopied ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
        </div>
        <pre className="bg-gray-900/70 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-[600px] whitespace-pre-wrap font-mono">
          <code>{displayScript}</code>
        </pre>
      </section>

      {/* Script Visuals Section */}
      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          Промпты для визуализации сценария
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {assets.scriptBlockPrompts.map((prompt, index) => (
            <PromptCard 
              key={index} 
              title={prompt.blockTitle}
              prompt={prompt.imagePrompt}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GeneratedAssetsComponent;