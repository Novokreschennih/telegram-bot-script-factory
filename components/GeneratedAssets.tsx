
import React, { useMemo, useState } from 'react';
import type { GeneratedAssets, ScriptNode } from '../types';
import { OUTPUT_FORMATS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { WandIcon } from './icons/WandIcon';
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

// Helper to generate a simple UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const scriptToN8nJson = (script: ScriptNode[]): string => {
    const nodes: any[] = [];
    const connections: any = {};
    const initialX = -1000;
    const initialY = 400;

    // 1. Telegram Trigger Node
    const triggerNode = {
        parameters: { updates: ["message", "callback_query"], additionalFields: {} },
        id: generateUUID(),
        name: "Telegram Trigger",
        type: "n8n-nodes-base.telegramTrigger",
        typeVersion: 1.1,
        position: [initialX, initialY],
        credentials: { telegramApi: { id: "YOUR_CREDENTIALS_ID", name: "YOUR_TELEGRAM_CREDENTIALS" } }
    };
    nodes.push(triggerNode);

    // 2. Set User Data Node
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
        position: [initialX + 220, initialY]
    };
    nodes.push(setUserDataNode);
    connections[triggerNode.name] = { main: [[{ node: setUserDataNode.name, type: "main", index: 0 }]] };
    
    // 3. Main Router (Switch) Node
    const routerNode = {
        parameters: { rules: { values: [] }, options: {} },
        id: generateUUID(),
        name: "Main Router",
        type: "n8n-nodes-base.switch",
        typeVersion: 3.2,
        position: [initialX + 440, initialY]
    };
    connections[setUserDataNode.name] = { main: [[{ node: routerNode.name, type: "main", index: 0 }]] };

    // 4. Create all message and wait nodes
    const messageNodes: any[] = [];
    script.forEach((node, index) => {
        const messageNode = {
            parameters: {
                chatId: "={{ $('Set User Data').item.json.chat_id }}",
                text: node.text,
                additionalFields: {}
            },
            id: generateUUID(),
            name: `БЛОК ${index + 1}: Сообщение`,
            type: "n8n-nodes-base.telegram",
            typeVersion: 1.2,
            position: [0, 0], // Placeholder position
            credentials: { telegramApi: { id: "YOUR_CREDENTIALS_ID", name: "YOUR_TELEGRAM_CREDENTIALS" } }
        };
        if (node.buttons && node.buttons.length > 0) {
            // FIX: Cast parameters to `any` to allow adding `replyMarkup`, as it doesn't exist on the inferred type.
            (messageNode.parameters as any).replyMarkup = "inlineKeyboard";
            (messageNode.parameters as any).inlineKeyboard = {
                rows: node.buttons.map(buttonRow => ({
                    row: {
                        buttons: buttonRow.map(button => ({
                            text: button.text,
                            additionalFields: { callback_data: button.callback_data }
                        }))
                    }
                }))
            };
        }
        messageNodes.push(messageNode);
    });

    // 5. Build connections and create router rules
    const routerConnections: any[][] = [];
    
    // Rule for /start
    if (messageNodes.length > 0) {
        routerNode.parameters.rules.values.push({
            conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [{
                    id: generateUUID(),
                    leftValue: "={{ $json.input_data }}",
                    rightValue: "/start",
                    operator: { type: "string", operation: "equals" }
                }],
                combinator: "and"
            }
        });
        routerConnections.push([{ node: messageNodes[0].name, type: "main", index: 0 }]);
    }

    const branches: any[][] = [];
    let currentBranch: any[] = [];

    messageNodes.forEach((msgNode, index) => {
        currentBranch.push(msgNode);
        if ((msgNode.parameters as any).replyMarkup === 'inlineKeyboard' || index === messageNodes.length - 1) {
            branches.push(currentBranch);
            currentBranch = [];
        }
    });

    let branchStartY = initialY - 600;
    branches.forEach((branch, branchIndex) => {
        let branchX = initialX + 660;
        
        // Connect router to the start of the branch
        if (branchIndex > 0) {
            const previousBranch = branches[branchIndex - 1];
            const triggerNode = previousBranch[previousBranch.length - 1];
            
            const callbacks = (triggerNode.parameters as any).inlineKeyboard.rows
                .flatMap((r: any) => r.row.buttons)
                .map((b: any) => b.additionalFields.callback_data);
            
            if (callbacks.length > 0) {
                const conditions = callbacks.map((cb: string) => ({
                    id: generateUUID(),
                    leftValue: "={{ $json.input_data }}",
                    rightValue: cb,
                    operator: { type: "string", operation: "equals" }
                }));
                routerNode.parameters.rules.values.push({
                    conditions: {
                        options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                        conditions: conditions,
                        combinator: "or"
                    }
                });
                routerConnections.push([{ node: branch[0].name, type: "main", index: 0 }]);
            }
        }
        
        branch.forEach((node, nodeIndex) => {
            node.position = [branchX, branchStartY];
            nodes.push(node);

            if (nodeIndex < branch.length - 1) {
                branchX += 220;
                const waitNode = {
                    parameters: { amount: 15 },
                    id: generateUUID(),
                    name: `Wait ${nodes.length}`,
                    type: "n8n-nodes-base.wait",
                    typeVersion: 1.1,
                    position: [branchX, branchStartY],
                };
                nodes.push(waitNode);
                connections[node.name] = { main: [[{ node: waitNode.name, type: "main", index: 0 }]] };
                connections[waitNode.name] = { main: [[{ node: branch[nodeIndex + 1].name, type: "main", index: 0 }]] };
                branchX += 220;
            }
        });
        branchStartY += 250;
    });
    
    nodes.push(routerNode);
    connections[routerNode.name] = { main: routerConnections };

    const n8nWorkflow = {
        nodes,
        connections,
        meta: { instanceId: generateUUID().substring(0, 64) },
        pinData: {}
    };
    
    return JSON.stringify(n8nWorkflow, null, 2);
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
        
        {/* Chat Preview */}
        <div className="bg-gray-900/70 rounded-lg p-4 space-y-4 max-h-[600px] overflow-y-auto mb-6">
          {assets.customizedScript.map((node, index) => {
            const isRegeneratingThisMessage = regeneratingMessageIndex === index;
            const isAnyMessageRegenerating = regeneratingMessageIndex !== null;

            return (
              <div key={index} className="flex flex-col items-start group relative">
                  <div className={`w-full text-left bg-purple-900/40 rounded-lg rounded-tl-none p-3 max-w-xl transition-all duration-300 ${isAnyMessageRegenerating && !isRegeneratingThisMessage ? 'opacity-50 blur-sm' : ''}`}>
                      {isRegeneratingThisMessage ? (
                          <div className="flex items-center justify-center h-10">
                              <LoadingSpinner />
                          </div>
                      ) : (
                          <>
                              <p className="text-gray-200 whitespace-pre-wrap">{parseTelegramMarkdown(node.text)}</p>
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
                                      onClick={() => handleCopyMessage(node.text, index)}
                                      className="p-1.5 bg-gray-700/80 text-gray-300 rounded-full hover:bg-gray-600"
                                      title="Копировать сообщение"
                                  >
                                      {copiedMessageIndex === index ? <CheckIcon /> : <CopyIcon />}
                                  </button>
                              </div>
                          </>
                      )}
                  </div>
                {node.buttons && node.buttons.length > 0 && (
                  <div className={`mt-2 flex flex-wrap gap-2 transition-opacity duration-300 ${isAnyMessageRegenerating || isRegeneratingAll ? 'opacity-50' : ''}`}>
                    {node.buttons.flat().map((button, btnIndex) => {
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
          })}
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
