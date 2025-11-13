
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GeneratedAssets, TextGenerationResponse } from '../types';

const getAiClient = (apiKey: string) => {
    if (!apiKey) {
        throw new Error('API key is not configured.');
    }
    return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getSalesFrameworkInstruction = (framework: string): string => {
    switch (framework) {
        case 'AIDA':
            return 'AIDA (Внимание, Интерес, Желание, Действие). Структурируй диалог, чтобы сначала привлечь внимание пользователя, затем вызвать интерес к продукту/услуге, после этого создать сильное желание и, наконец, предложить четкое действие.';
        case 'PAS':
            return 'PAS (Проблема, Агитация, Решение). Начни с определения проблемы пользователя, затем усугуби ее (покажи негативные последствия), и после этого представь свой продукт как идеальное решение.';
        case 'FAB':
            return 'FAB (Свойства, Преимущества, Выгоды). Фокусируйся на том, чтобы сначала описать свойство продукта, затем объяснить его преимущество и, самое главное, показать личную выгоду для клиента.';
        case 'Storytelling':
            return 'Сторителлинг. Построй повествование вокруг истории (например, истории клиента или компании), чтобы эмоционально вовлечь пользователя и сделать предложение более запоминающимся.';
        case 'None':
        default:
            return 'Не используется. Создавай логичный и последовательный диалог без привязки к конкретной маркетинговой модели.';
    }
};

const generateTextContent = async (
    mode: 'customize' | 'create',
    mainInputText: string,
    userStory: string,
    writingStyle: string,
    targetAudience: string,
    botGoal: string,
    formality: string,
    emojiFrequency: string,
    responseLength: string,
    languageComplexity: string,
    salesFramework: string,
    apiKey: string,
): Promise<TextGenerationResponse> => {
    const ai = getAiClient(apiKey);
    const model = 'gemini-2.5-pro';
    
    const coreTaskInstruction = mode === 'customize' 
    ? `
        Твоя задача — проанализировать предоставленный **исходный сценарий** и сгенерировать полный пакет материалов на основе настроек пользователя.

        **Исходный сценарий:**
        \`\`\`
        ${mainInputText}
        \`\`\`
    `
    : `
        Твоя задача — на основе предоставленной **идеи/контекста** создать с нуля полный сценарий для чат-бота и сгенерировать пакет брендинговых материалов. Продумай логическую структуру диалога: приветствие, главное меню, несколько ключевых веток и завершение диалога.

        **Идея/контекст для бота:**
        \`\`\`
        ${mainInputText}
        \`\`\`
    `;

    const responseLengthInstruction = mode === 'customize' && responseLength === 'As in original'
      ? 'Сохраняй длину и структуру сообщений как можно ближе к исходному сценарию. Твоя задача — изменить тон и стиль, а не темп диалога.'
      : responseLength;

    const salesFrameworkInstruction = getSalesFrameworkInstruction(salesFramework);

    const prompt = `
        Ты — эксперт по написанию сценариев для чат-ботов Telegram и специалист по брендингу. ${coreTaskInstruction}

        **Входные данные:**

        1.  **История пользователя для интеграции (если есть):**
            \`\`\`
            ${userStory || 'Дополнительная история не предоставлена.'}
            \`\`\`
        2.  **Настройки:**
            *   **Стиль написания:** ${writingStyle}
            *   **Целевая аудитория:** ${targetAudience}
            *   **Основная цель:** ${botGoal}
            *   **Маркетинговая модель продаж:** ${salesFrameworkInstruction}
            *   **Уровень формальности:** ${formality}
            *   **Частота эмодзи:** ${emojiFrequency}
            *   **Длина ответов:** ${responseLengthInstruction}
            *   **Сложность языка:** ${languageComplexity}

        **Твоя задача:**

        Сгенерируй JSON-объект со следующей структурой. Не добавляй никакого текста за пределами самого JSON-объекта.

        \`\`\`json
        {
          "profilePicturePrompt": "Детальный, визуально насыщенный промпт для генерации изображения профиля бота. Стиль: современная иконка приложения, минимализм, дружелюбный маскот.",
          "description": "Короткое, броское и убедительное описание для профиля бота в Telegram (максимум 2-3 предложения).",
          "capabilities": [
            "Маркированный список того, что может делать этот бот.",
            "Каждый элемент списка должен быть строкой.",
            "Четко и лаконично суммируй основные функции."
          ],
          "customizedScript": [
             {
                "text": "Текст первого сообщения от бота.",
                "buttons": [[{"text": "Кнопка 1", "callback_data": "action1"}]]
             },
             {
                "text": "Текст второго сообщения."
             }
          ],
          "scriptBlocks": [
            {
              "title": "Короткое, описательное название для ключевого блока/шага в сценарии.",
              "description": "Краткое описание этого блока, подходящее в качестве текстового промпта для ИИ, генерирующего изображения."
            }
          ]
        }
        \`\`\`
        
        **Инструкции по генерации:**

        -   **profilePicturePrompt:** Создай промпт для ИИ, генерирующего изображения. Промпт должен быть на английском языке, детализированным, и описывать абстрактную иконку или маскота для аватара Telegram-бота. Пример: "A friendly, minimalist robot mascot waving, vector art, vibrant colors, clean lines, circular background, suitable for a small profile picture".
        -   **description:** Сделай его привлекательным и соответствующим цели и тону бота.
        -   **capabilities:** Будь прямым и ясным. Начинай каждый пункт с глагола действия.
        -   **customizedScript:** Это самая важная часть. Перепиши весь сценарий (или создай с нуля), а не просто добавляй комментарии. Тон, лексика, структура предложений, использование эмодзи и длина ответов должны идеально отражать ВСЕ выбранные настройки. Если выбрана **маркетинговая модель продаж**, убедись, что структура диалога следует ее принципам.
            -   **Форматирование:** Используй Markdown, совместимый с Telegram (*жирный текст* , _курсив_ , __подчеркнутый__), внутри значения ключа \`text\` для улучшения читаемости.
            -   **Структура вывода:** Верни сценарий СТРОГО в формате JSON-массива объектов. Каждый элемент массива — это объект, представляющий одно сообщение от бота. Объект должен иметь ключ \`text\` со строковым значением. Если у сообщения есть кнопки, добавь ключ \`buttons\` с массивом массивов объектов кнопок (формат Telegram Bot API: \`[[{"text": "Button 1", "callback_data": "data1"}]]\`).
        -   **scriptBlocks:** Определи 3-5 основных логических разделов в адаптированном сценарии. **Логический раздел — это группа сообщений, которая заканчивается предложением пользователю совершить действие (например, нажать на кнопки).** 'description' для каждого блока должен быть визуальным промптом на английском языке. Например: "A friendly robot waving hello to a new user, with message bubbles in the background, digital illustration style."
    `;
    
    const requestConfig = {
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              profilePicturePrompt: { type: Type.STRING },
              description: { type: Type.STRING },
              capabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
              customizedScript: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    buttons: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            text: { type: Type.STRING },
                            callback_data: { type: Type.STRING }
                          },
                          required: ['text', 'callback_data']
                        }
                      }
                    }
                  },
                  required: ['text']
                }
              },
              scriptBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ['title', 'description']
                }
              }
            },
            required: ['profilePicturePrompt', 'description', 'capabilities', 'customizedScript', 'scriptBlocks']
          }
        }
    };
    
    const MAX_RETRIES = 3;
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            const response = await ai.models.generateContent(requestConfig);

            const jsonText = response.text.trim();
            try {
                return JSON.parse(jsonText) as TextGenerationResponse;
            } catch (e) {
                console.error("Failed to parse model response:", jsonText);
                throw new SyntaxError("Model returned invalid JSON.");
            }
        } catch (err: any) {
            attempt++;
            const isRetryable = err instanceof Error && (
                err.message.includes('503') || 
                err.message.includes('UNAVAILABLE') || 
                err.message.includes('The model is overloaded')
            );

            if (isRetryable && attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
                console.warn(`Attempt ${attempt} failed with a retryable error. Retrying in ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                console.error(`Generation failed on attempt ${attempt}.`, err);
                throw err; // Re-throw the last error to be handled by the UI
            }
        }
    }
    // Fallback error, should not be reached if MAX_RETRIES > 0.
    throw new Error('Generation failed after multiple retries.');
};

export const regenerateSingleMessage = async (
    settings: {
        userStory: string;
        writingStyle: string;
        targetAudience: string;
        botGoal: string;
        formality: string;
        emojiFrequency: string;
        responseLength: string;
        languageComplexity: string;
        salesFramework: string;
    },
    currentGeneratedScript: string, // The full script generated so far, for context
    messageToRegenerate: string,
    apiKey: string,
): Promise<string> => {
    const ai = getAiClient(apiKey);
    const model = 'gemini-2.5-pro';

    const prompt = `
        Ты — эксперт по написанию сценариев для чат-ботов. Твоя задача — переписать ОДНО КОНКРЕТНОЕ сообщение в рамках уже существующего диалога, сохраняя общий тон, стиль и контекст.
        
        **Контекст:**

        1.  **Общие настройки стиля:**
            *   Стиль: ${settings.writingStyle}
            *   Аудитория: ${settings.targetAudience}
            *   Цель: ${settings.botGoal}
            *   Формальность: ${settings.formality}
            *   Эмодзи: ${settings.emojiFrequency}
            *   Длина ответов: ${settings.responseLength}
            *   Сложность языка: ${settings.languageComplexity}
            *   Модель продаж: ${getSalesFrameworkInstruction(settings.salesFramework)}
            *   История пользователя: ${settings.userStory || 'Нет'}

        2.  **Полный сгенерированный диалог (для понимания контекста):**
            \`\`\`
            ${currentGeneratedScript}
            \`\`\`

        **Задача:**

        Перепиши следующее сообщение, чтобы предложить альтернативный вариант, который соответствует всем указанным выше настройкам и контексту диалога.

        **Сообщение для перегенерации:**
        \`\`\`
        ${messageToRegenerate}
        \`\`\`

        **Требования к ответу:**
        -   Верни ТОЛЬКО новый текст для этого одного сообщения.
        -   Не добавляй никаких объяснений, префиксов вроде "Вот новый вариант:" или JSON-форматирования.
        -   Сохрани Markdown-форматирование, совместимое с Telegram (*жирный*, _курсив_).
        -   Твой ответ должен быть просто строкой с новым текстом сообщения.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text.trim();
};

export const generateImageFromPrompt = async (prompt: string, apiKey: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    const model = 'gemini-2.5-flash-image';
    
    const requestConfig = {
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE] as Modality[],
        },
    };

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const response = await ai.models.generateContent(requestConfig);

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
            throw new Error('В ответе не найдены данные изображения.');

        } catch (err: any) {
            attempt++;
            const errorMessage = (err.message || '').toLowerCase();
            console.error(`Image generation failed on attempt ${attempt}.`, err);

            const isRetryable = errorMessage.includes('429') ||
                                errorMessage.includes('resource_exhausted') ||
                                errorMessage.includes('overloaded') ||
                                errorMessage.includes('503') ||
                                errorMessage.includes('unavailable');

            if (isRetryable && attempt < MAX_RETRIES) {
                let delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s

                if (err.message) {
                    try {
                        const errorJson = JSON.parse(err.message);
                        const retryInfo = errorJson?.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                        if (retryInfo?.retryDelay) {
                            const seconds = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
                            if (!isNaN(seconds)) {
                               delay = (seconds * 1000) + Math.floor(Math.random() * 1000);
                            }
                        }
                    } catch (e) {
                        // Not a JSON message, stick to exponential backoff
                    }
                }
                
                console.warn(`Attempt ${attempt} failed with a retryable error. Retrying in ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                if (errorMessage.includes('block') && errorMessage.includes('safety')) {
                    throw new Error('Запрос на изображение заблокирован из-за настроек безопасности.');
                }
                if (isRetryable) {
                     throw new Error('Вы превысили лимит запросов. Пожалуйста, подождите и попробуйте снова, или проверьте ваш план и биллинг.');
                }
                throw err;
            }
        }
    }
    
    throw new Error('Не удалось сгенерировать изображение после нескольких попыток.');
};


export const generateBotAssets = async (
    mode: 'customize' | 'create',
    mainInputText: string,
    userStory: string,
    writingStyle: string,
    targetAudience: string,
    botGoal: string,
    formality: string,
    emojiFrequency: string,
    responseLength: string,
    languageComplexity: string,
    salesFramework: string,
    apiKey: string,
): Promise<GeneratedAssets> => {
    
    const textData = await generateTextContent(
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
        salesFramework,
        apiKey
    );

    return {
        profilePicturePrompt: textData.profilePicturePrompt,
        description: textData.description,
        capabilities: textData.capabilities.join('\n'),
        customizedScript: textData.customizedScript,
        scriptBlockPrompts: textData.scriptBlocks.map(block => ({
            blockTitle: block.title,
            imagePrompt: block.description
        }))
    };
};
