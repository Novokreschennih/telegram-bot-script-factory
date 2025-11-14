
import React, { useMemo, useState } from 'react';
import type { GeneratedAssets, CustomizedScriptItem, ScriptNode } from '../types';
import { OUTPUT_FORMATS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { WandIcon } from './icons/WandIcon';
import { ImageIcon } from './icons/ImageIcon';
import LoadingSpinner from './LoadingSpinner';
import ImageGenerationCard from './ImageGenerationCard';

interface GeneratedAssetsProps {
  assets: GeneratedAssets;
  onRegenerateAll: () => void;
  onRegenerateSingleMessage: (index: number) => void;
  isRegeneratingAll: boolean;
  regeneratingMessageIndex: number | null;
  apiKey: string;
}

const isScriptNode = (item: CustomizedScriptItem): item is ScriptNode => {
    return (item as ScriptNode).text !== undefined;
};

const scriptToMarkdown = (script: CustomizedScriptItem[]): string => {
    return script.map(item => {
        if (isScriptNode(item)) {
            let text = item.text;
            if (item.buttons && item.buttons.length > 0) {
                const buttonText = item.buttons.flat().map(btn => `[ ${btn.text} ]`).join(' ');
                text += `\n\n${buttonText}`;
            }
            return text;
        } else {
            return `\n[ИЗОБРАЖЕНИЕ: ${item.imagePlaceholderFor}]\n`;
        }
    }).join('\n\n---\n\n');
};

const scriptToText = (script: CustomizedScriptItem[]): string => {
    return script.map(item => {
        if (isScriptNode(item)) {
            let text = item.text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
            if (item.buttons && item.buttons.length > 0) {
                const buttonText = item.buttons.flat().map(btn => `[ ${btn.text} ]`).join(' ');
                text += `\n\n${buttonText}`;
            }
            return text;
        } else {
            return `\n[ИЗОБРАЖЕНИЕ: ${item.imagePlaceholderFor}]\n`;
        }
    }).join('\n\n---\n\n');
};

const scriptToJson = (script: CustomizedScriptItem[]): string => {
    return JSON.stringify(script, null, 2);
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const scriptToN8nJson = (script: CustomizedScriptItem[], scriptBlockPrompts: GeneratedAssets['scriptBlockPrompts']): string => {
    const nodes: any[] = [];
    const connections: any = {};
    const initialX = -1000;
    const initialY = 400;
    let lastNodeName: string | null = null;
    let lastNodePosition = { x: initialX, y: initialY };

    const triggerNode = {
        parameters: { updates: ["message", "callback_query"], additionalFields: {} },
        id: generateUUID(),
        name: "Telegram Trigger",
        type: "n8n-nodes-base.telegramTrigger",
        typeVersion: 1.1,
        position: [lastNodePosition.x, lastNodePosition.y],
        credentials: { telegramApi: { id: "YOUR_CREDENTIALS_ID", name: "YOUR_TELEGRAM_CREDENTIALS" } }
    };
    nodes.push(triggerNode);
    lastNodeName = triggerNode.name;
    lastNodePosition.x += 220;

    const setUserDataNode = {
        parameters: {
            assignments: {
                assignments: [
                    { id: generateUUID(), name: "chat_id", value: "={{ $('Telegram Trigger').item.json.callback_query ? $('Telegram Trigger').item.json.callback_query.message.chat.id : $('Telegram Trigger').item.json.message.chat.id }}", type: "string" },
                    { id: generateUUID(), name: "first_name", value: "={{ $('Telegram Trigger').item.json.callback_query ? $('Telegram Trigger').item.json.callback_query.from.first_name : $('Telegram Trigger').item.json.message.from.first_name }}", type: "string" },
                    { id: generateUUID(), name: "input_data", value: "={{ $('Telegram Trigger').item.json.callback_query ? $('Telegram Trigger').item.json.callback_query.data : $('Telegram Trigger').item.json.message.text }}", type: "string" }
                ]
            },
            options: {}
        },
        id: generateUUID(),
        name: "Set User Data",
        type: "n8n-nodes-base.set",
        typeVersion: 3.4,
        position: [lastNodePosition.x, lastNodePosition.y]
    };
    nodes.push(setUserDataNode);
    connections[lastNodeName] = { main: [[{ node: setUserDataNode.name, type: "main", index: 0 }]] };
    lastNodeName = setUserDataNode.name;
    lastNodePosition.x += 220;
    
    const routerNode = {
        parameters: { rules: { values: [] }, options: {} },
        id: generateUUID(),
        name: "Main Router",
        type: "n8n-nodes-base.switch",
        typeVersion: 3.2,
        position: [lastNodePosition.x, lastNodePosition.y]
    };
    connections[lastNodeName] = { main: [[{ node: routerNode.name, type: "main", index: 0 }]] };
    
    const scriptItemNodes: any[] = [];
    script.forEach((item, index) => {
        let node: any;
        if(isScriptNode(item)) {
            node = {
                parameters: {
                    chatId: "={{ $('Set User Data').item.json.chat_id }}",
                    text: item.text,
                    additionalFields: {}
                },
                id: generateUUID(),
                name: `Сообщение ${index + 1}`,
                type: "n8n-nodes-base.telegram",
                typeVersion: 1.2,
                position: [0, 0],
                credentials: { telegramApi: { id: "YOUR_CREDENTIALS_ID", name: "YOUR_TELEGRAM_CREDENTIALS" } }
            };
            if (item.buttons && item.buttons.length > 0) {
                (node.parameters as any).replyMarkup = "inlineKeyboard";
                (node.parameters as any).inlineKeyboard = {
                    rows: item.buttons.map(buttonRow => ({
                        row: {
                            buttons: buttonRow.map(button => ({
                                text: button.text,
                                additionalFields: { callback_data: button.callback_data }
                            }))
                        }
                    }))
                };
            }
        } else {
            const promptData = scriptBlockPrompts.find(p => p.blockTitle === item.imagePlaceholderFor);
            node = {
                parameters: {
                    operation: 'sendPhoto',
                    chatId: "={{ $('Set User Data').item.json.chat_id }}",
                    fileIdOrUrl: "URL_СГЕНЕРИРОВАННОГО_ИЗОБРАЖЕНИЯ",
                    additionalFields: {
                        caption: `AI Prompt: ${promptData?.imagePrompt || 'No prompt found'}`
                    }
                },
                id: generateUUID(),
                name: `Изображение: ${item.imagePlaceholderFor}`,
                type: "n8n-nodes-base.telegram",
                typeVersion: 1.2,
                position: [0, 0],
                credentials: { telegramApi: { id: "YOUR_CREDENTIALS_ID", name: "YOUR_TELEGRAM_CREDENTIALS" } }
            };
        }
        scriptItemNodes.push(node);
    });

    const routerConnections: any[][] = [];
    if (scriptItemNodes.length > 0) {
        routerNode.parameters.rules.values.push({
            conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [{
                    id: generateUUID(), leftValue: "={{ $json.input_data }}", rightValue: "/start", operator: { type: "string", operation: "equals" }
                }],
                combinator: "and"
            }
        });
        routerConnections.push([{ node: scriptItemNodes[0].name, type: "main", index: 0 }]);
    }

    let branchStartY = lastNodePosition.y - 400;
    const allCallbacks = new Set<string>();
    
    let currentBranch: any[] = [];
    const branches: any[][] = [];

    scriptItemNodes.forEach((node) => {
        currentBranch.push(node);
        if ((node.parameters as any).replyMarkup === 'inlineKeyboard' || node === scriptItemNodes[scriptItemNodes.length - 1]) {
            branches.push(currentBranch);
            currentBranch = [];
        }
    });

    branches.forEach((branch, branchIndex) => {
        let branchX = lastNodePosition.x + 220;
        
        if (branchIndex > 0) {
            const previousBranch = branches[branchIndex - 1];
            const triggerNode = previousBranch[previousBranch.length - 1];
            
            const callbacks = ((triggerNode.parameters as any).inlineKeyboard?.rows || [])
                .flatMap((r: any) => r.row.buttons)
                .map((b: any) => b.additionalFields.callback_data);

            if (callbacks.length > 0) {
                const uniqueCallbacks = callbacks.filter((cb: string) => !allCallbacks.has(cb));
                uniqueCallbacks.forEach((cb: string) => allCallbacks.add(cb));

                if (uniqueCallbacks.length > 0) {
                    routerNode.parameters.rules.values.push({
                        conditions: {
                            options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                            conditions: uniqueCallbacks.map((cb: string) => ({
                                id: generateUUID(), leftValue: "={{ $json.input_data }}", rightValue: cb, operator: { type: "string", operation: "equals" }
                            })),
                            combinator: "or"
                        }
                    });
                    routerConnections.push([{ node: branch[0].name, type: "main", index: 0 }]);
                }
            }
        }
        
        let lastBranchNodeName: string | null = null;
        branch.forEach((node) => {
            node.position = [branchX, branchStartY];
            nodes.push(node);
            
            if (lastBranchNodeName) {
                connections[lastBranchNodeName] = { main: [[{ node: node.name, type: "main", index: 0 }]] };
            }
            lastBranchNodeName = node.name;
            branchX += 220;
        });

        branchStartY += 250;
    });
    
    nodes.push(routerNode);
    connections[routerNode.name] = { main: routerConnections };

    return JSON.stringify({ nodes, connections, meta: { instanceId: generateUUID().substring(0, 64) }, pinData: {} }, null, 2);
};

const parseTelegramMarkdown = (text: string): React.ReactNode[] => {
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

const GeneratedAssetsComponent: React.FC<GeneratedAssetsProps> = ({ 
    assets,
    onRegenerateAll,
    onRegenerateSingleMessage,
    isRegeneratingAll,
    regeneratingMessageIndex,
    apiKey
}) => {
  const [scriptCopied, setScriptCopied] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>(OUTPUT_FORMATS[0].value);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [copiedButtonKey, setCopiedButtonKey] = useState<string | null>(null);

  const formattedScript = useMemo(() => {
    if (!assets.customizedScript) return '';
    switch (selectedFormat) {
        case 'Markdown':
            return scriptToMarkdown(assets.customizedScript);
        case 'n8n JSON':
            return scriptToN8nJson(assets.customizedScript, assets.scriptBlockPrompts);
        case 'JSON':
            return scriptToJson(assets.customizedScript);
        case 'Text':
            return scriptToText(assets.customizedScript);
        default:
            return scriptToMarkdown(assets.customizedScript);
    }
  }, [assets.customizedScript, assets.scriptBlockPrompts, selectedFormat]);


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
  
  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => {
      setCopiedMessageIndex(null);
    }, 2000);
  };

  const handleCopyButton = (text: string, messageIndex: number, btnIndex: number) => {
    navigator.clipboard.writeText(text);
    const key = `${messageIndex}-${btnIndex}`;
    setCopiedButtonKey(key);
    setTimeout(() => {
        setCopiedButtonKey(null);
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-fadeIn">
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

      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center gap-4 mb-6">
            <div className="flex-grow">
                <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    Предпросмотр сценария
                </h2>
                <p className="text-gray-400">Нажмите на иконки, чтобы скопировать текст или перегенерировать сообщение.</p>
            </div>
            <button 
                onClick={onRegenerateAll}
                disabled={isRegeneratingAll || regeneratingMessageIndex !== null}
                className="flex items-center gap-2 bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed md:ml-auto"
            >
                {isRegeneratingAll ? <LoadingSpinner /> : <RefreshIcon />}
                <span>{isRegeneratingAll ? 'Обновляем...' : 'Перегенерировать всё'}</span>
            </button>
        </div>
        
        <div className="bg-gray-900/70 rounded-lg p-4 space-y-4 max-h-[600px] overflow-y-auto mb-6">
          {assets.customizedScript.map((item, index) => {
            const isRegeneratingThisMessage = regeneratingMessageIndex === index;
            const isAnyMessageRegenerating = regeneratingMessageIndex !== null;
            
            if (isScriptNode(item)) {
              return (
                <div key={index} className="flex flex-col items-start group relative">
                    <div className={`w-full text-left bg-purple-900/40 rounded-lg rounded-tl-none p-3 max-w-xl transition-all duration-300 ${isAnyMessageRegenerating && !isRegeneratingThisMessage ? 'opacity-50 blur-sm' : ''}`}>
                        {isRegeneratingThisMessage ? (
                            <div className="flex items-center justify-center h-10">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-200 whitespace-pre-wrap">{parseTelegramMarkdown(item.text)}</p>
                                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button 
                                        onClick={() => onRegenerateSingleMessage(index)}
                                        disabled={isAnyMessageRegenerating || isRegeneratingAll}
                                        className="p-1.5 bg-gray-700/80 text-purple-300 rounded-full hover:bg-purple-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Перегенерировать это сообщение"
                                    >
                                        <WandIcon />
                                    </button>
                                    <button
                                        onClick={() => handleCopyMessage(item.text, index)}
                                        className="p-1.5 bg-gray-700/80 text-gray-300 rounded-full hover:bg-gray-600"
                                        title="Копировать сообщение"
                                    >
                                        {copiedMessageIndex === index ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                  {item.buttons && item.buttons.length > 0 && (
                    <div className={`mt-2 flex flex-wrap gap-2 transition-opacity duration-300 ${isAnyMessageRegenerating || isRegeneratingAll ? 'opacity-50' : ''}`}>
                      {item.buttons.flat().map((button, btnIndex) => {
                        const buttonKey = `${index}-${btnIndex}`;
                        const isCopied = copiedButtonKey === buttonKey;
                        return (
                            <button
                                key={btnIndex}
                                onClick={() => handleCopyButton(button.text, index, btnIndex)}
                                disabled={isAnyMessageRegenerating || isRegeneratingAll}
                                className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 disabled:cursor-not-allowed ${
                                    isCopied
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600 cursor-pointer'
                                }`}
                                title={`Нажмите, чтобы скопировать: "${button.text}"`}
                            >
                                {isCopied ? 'Скопировано!' : button.text}
                            </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
                return (
                    <div key={index} className="flex justify-center my-2">
                        <div className={`flex items-center gap-2 text-sm text-gray-500 bg-gray-800/60 border border-dashed border-gray-600 rounded-lg px-4 py-2 transition-opacity duration-300 ${isAnyMessageRegenerating ? 'opacity-50' : ''}`}>
                            <ImageIcon />
                            <span>Изображение: <strong>{item.imagePlaceholderFor}</strong></span>
                        </div>
                    </div>
                );
            }
          })}
        </div>

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

      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          Визуализация сценария
        </h2>
        <p className="text-center text-gray-400 -mt-4 mb-8 max-w-2xl mx-auto">
            Создайте иллюстрации для ключевых моментов вашего сценария. Генерация может занять до 30 секунд.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {assets.scriptBlockPrompts.map((prompt, index) => (
            <ImageGenerationCard
              key={index} 
              title={prompt.blockTitle}
              prompt={prompt.imagePrompt}
              apiKey={apiKey}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GeneratedAssetsComponent;
