import React, { useMemo } from 'react';
import type { GeneratedAssets } from '../types';

interface GeneratedAssetsProps {
  assets: GeneratedAssets;
  outputFormat: string;
}

const GeneratedAssetsComponent: React.FC<GeneratedAssetsProps> = ({ assets, outputFormat }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(assets.customizedScript);
    alert('Сценарий скопирован в буфер обмена!');
  };

  const isJsonFormat = useMemo(() => outputFormat.toLowerCase().includes('json'), [outputFormat]);

  const displayScript = useMemo(() => {
    if (isJsonFormat && assets.customizedScript) {
        try {
            // The script is a string containing JSON, so we parse it for pretty printing
            return JSON.stringify(JSON.parse(assets.customizedScript), null, 2);
        } catch (e) {
            // If it fails to parse, show the raw string, maybe it's an error message
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex justify-center md:col-span-1">
            <img 
              src={assets.profilePictureUrl} 
              alt="Сгенерированный профиль бота"
              className="w-48 h-48 rounded-full object-cover shadow-lg shadow-purple-500/30 border-4 border-gray-700" 
            />
          </div>
          <div className="md:col-span-2 space-y-4">
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
        </div>
      </section>

      {/* Customized Script Section */}
      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Адаптированный сценарий
            </h2>
            <button
                onClick={copyToClipboard}
                className="bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                Копировать сценарий
            </button>
        </div>
        <pre className="bg-gray-900/70 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-[600px] whitespace-pre-wrap font-mono">
          <code>{displayScript}</code>
        </pre>
      </section>

      {/* Script Visuals Section */}
      <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          Визуализация сценария
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {assets.scriptBlockImages.map((image, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg overflow-hidden group">
              <img 
                src={image.imageUrl} 
                alt={image.blockTitle} 
                className="w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="p-3">
                <h4 className="text-sm md:text-base font-semibold text-gray-200 truncate">{image.blockTitle}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GeneratedAssetsComponent;
