
import React, { useState } from 'react';
import { generateImageFromPrompt } from '../services/geminiService';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ImageIcon } from './icons/ImageIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import LoadingSpinner from './LoadingSpinner';

interface ImageGenerationCardProps {
  title: string;
  prompt: string;
}

const ImageGenerationCard: React.FC<ImageGenerationCardProps> = ({ title, prompt }) => {
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const base64ImageBytes = await generateImageFromPrompt(prompt);
            setImageUrl(`data:image/png;base64,${base64ImageBytes}`);
        } catch (err) {
            console.error("Image generation failed:", err);
            if (err instanceof Error) {
                setError(err.message || "Не удалось сгенерировать изображение. Попробуйте снова.");
            } else {
                setError("Не удалось сгенерировать изображение. Попробуйте снова.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-900/50 rounded-lg overflow-hidden group p-4 flex flex-col aspect-square">
            <h4 className="text-sm md:text-base font-semibold text-gray-200 mb-2 truncate" title={title}>{title}</h4>
            
            <div className="relative flex-grow flex items-center justify-center bg-gray-800/40 rounded-md">
                {isLoading ? (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="text-sm text-gray-400 mt-2">Создание изображения...</p>
                    </div>
                ) : imageUrl ? (
                    <>
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={handleGenerate}
                                className="flex items-center gap-2 bg-gray-700/80 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                <RefreshIcon />
                                <span>Сгенерировать заново</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <button
                            onClick={handleGenerate}
                            className="flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
                        >
                            <ImageIcon />
                            <span className="font-semibold">Сгенерировать изображение</span>
                        </button>
                    </div>
                )}
            </div>

            {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}

            <p className="text-xs text-gray-500 font-mono my-3 h-10 overflow-y-auto">{prompt}</p>

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

export default ImageGenerationCard;
