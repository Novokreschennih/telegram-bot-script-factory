
import React, { useMemo, useState } from 'react';
import type { GeneratedAssets, ScriptNode } from '../types';
import { OUTPUT_FORMATS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface GeneratedAssetsProps {
  assets: GeneratedAssets;
}

const scriptToMarkdown = (script: ScriptNode[]): string => {
    return script.map(node => {
        let text = node.text;
        if (node.buttons && node.buttons.length > 0) {
            const buttonText = node.buttons.flat().map(btn => `[ ${btn.text} ]`).join(' ');
            text += `\n\n${buttonText}`;
        }
        return text;
    }).join('\n\n---\n\n');
};

const scriptToText = (script: ScriptNode[]): string => {
    return script.map(node => {
        let text = node.text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1'); // Экранирование Markdown символов
        if (node.buttons && node.buttons.length > 0) {
            const buttonText = node.buttons.flat().map(btn => `[ ${btn.text} ]`).join(' ');
            text += `\n\n${buttonText}`;
        }
        return text;
    }).join('\n\n---\n\n');
};

const scriptToJson = (script: ScriptNode[]): string => {
    return JSON.stringify(script, null, 2);
};

const scriptToN8nJson = (script: ScriptNode[]): string => {
    const n8nNodes = script.map(node => ({
      text: node.text,
      buttons: node.buttons || []
    }));
    return JSON.stringify(n8nNodes, null, 2);
};

// Helper to parse simple Telegram-like Markdown for preview
const parseTelegramMarkdown = (text: string): React.ReactNode[] => {
  // Regex to split by *, _, and __, keeping the delimiters
  const parts = text.split(/(\*.*?\*|__.*?__|_.*?_)/g);
  return parts.filter(part => part).map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__') && part.length > 3) {
      return <u key={index}>{part.slice(2, -2)}</u>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 1) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};


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

const GeneratedAssetsComponent: React.FC<GeneratedAssetsProps> = ({ assets }) => {
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>(OUTPUT_FORMATS[0].value);

  const formattedScript = useMemo(() => {
    if (!assets.customizedScript) return '';
    switch (selectedFormat) {
        case 'Markdown':
            return scriptToMarkdown(assets.customizedScript);
        case 'n8n JSON':
            return scriptToN8nJson(assets.customizedScript);
        case 'JSON':
            return scriptToJson(assets.customizedScript);
        case 'Text':
            return scriptToText(assets.customizedScript);
        default:
            return scriptToMarkdown(assets.customizedScript);
    }
  }, [assets.customizedScript, selectedFormat]);


  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedScript);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };
  
  const handleDownload = () => {
    let mimeType = 'text/plain;charset=utf-8';
    let extension = 'txt';

    if (selectedFormat === 'Markdown') {
        mimeType = 'text/markdown;charset=utf-8';
        extension = 'md';
    } else if (selectedFormat.toLowerCase().includes('json')) {
        mimeType = 'application/json;charset=utf-8';
        extension = 'json';
    }

    const blob = new Blob([formattedScript], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customized_script.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Предпросмотр сценария
        </h2>
        
        {/* Chat Preview */}
        <div className="bg-gray-900/70 rounded-lg p-4 space-y-4 max-h-[600px] overflow-y-auto mb-6">
          {assets.customizedScript.map((node, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="bg-purple-900/40 rounded-lg rounded-tl-none p-3 max-w-xl">
                <p className="text-gray-200 whitespace-pre-wrap">{parseTelegramMarkdown(node.text)}</p>
              </div>
              {node.buttons && node.buttons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {node.buttons.flat().map((button, btnIndex) => (
                    <div key={btnIndex} className="bg-gray-700/80 text-gray-300 rounded-full px-4 py-1.5 text-sm cursor-default">
                      {button.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Export and Code View Controls */}
        <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <label htmlFor="format-select" className="block text-sm font-medium text-gray-300 mb-2">Формат для экспорта:</label>
                    <div id="format-select" className="flex flex-wrap gap-2">
                      {OUTPUT_FORMATS.map(format => (
                          <button
                              key={format.value}
                              onClick={() => setSelectedFormat(format.value)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                  selectedFormat === format.value
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                          >
                              {format.label}
                          </button>
                      ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 self-end">
                  <button
                      onClick={handleDownload}
                      title="Скачать файл в выбранном формате"
                      className="flex items-center gap-2 bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                      <DownloadIcon />
                      Скачать
                  </button>
                  <button
                      onClick={copyToClipboard}
                      title="Копировать код в выбранном формате"
                      className="flex items-center gap-2 bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                      {scriptCopied ? <CheckIcon /> : <CopyIcon />}
                      {scriptCopied ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
            </div>
            
            <div className="mt-4">
                <button 
                    onClick={() => setShowRawCode(!showRawCode)}
                    className="text-sm text-purple-400 hover:underline"
                >
                    {showRawCode ? 'Скрыть код' : 'Показать код'}
                </button>
            </div>
            
            {showRawCode && (
              <pre className="mt-4 bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-[400px] whitespace-pre-wrap font-mono">
                <code>{formattedScript}</code>
              </pre>
            )}
        </div>

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
