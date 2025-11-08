
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedAssets, TextGenerationResponse } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
): Promise<TextGenerationResponse> => {
    const ai = getAiClient();
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
        -   **customizedScript:** Это самая важная часть. Перепиши весь сценарий (или создай с нуля), а не просто добавляй комментарии. Тон, лексика, структура предложений, использование эмодзи и длина ответов должны идеально отражать ВСЕ выбранные настройки.
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
