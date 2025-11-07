import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedAssets, TextGenerationResponse } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
    outputFormat: string
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
            *   **Требуемый формат вывода сценария:** ${outputFormat}

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
          "customizedScript": "Полный, переработанный сценарий чат-бота в указанном формате.",
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
            -   **Форматирование:** Используй Markdown, совместимый с Telegram (*жирный текст* , _курсив_ , __подчеркнутый__), для улучшения читаемости. Используй логические отступы и пустые строки для разделения сообщений.
            -   **Формат вывода:** Сгенерируй 'customizedScript' СТРОГО в формате "${outputFormat}".
                -   **Markdown**: Верни весь сценарий как единую строку с Markdown-разметкой.
                -   **Text**: Верни сценарий как единую строку, но без какой-либо Markdown-разметки.
                -   **JSON**: Верни СТРОКУ, содержащую JSON-массив. Каждый элемент массива должен быть объектом вида \`{"message": "Текст сообщения здесь"}\`.
                -   **n8n JSON**: Верни СТРОКУ, содержащую JSON-массив. Каждый элемент массива представляет узел сообщения n8n и должен иметь формат \`{"text": "Текст сообщения", "buttons": [[{"text": "Текст кнопки", "callback_data": "data"}]]}\`. Если у сообщения нет кнопок, поле "buttons" должно быть пустым массивом \`[]\`.
        -   **scriptBlocks:** Определи 3-5 основных логических разделов в адаптированном сценарии. **Логический раздел — это группа сообщений, которая заканчивается предложением пользователю совершить действие (например, нажать на кнопки).** 'description' для каждого блока должен быть визуальным промптом на английском языке. Например: "A friendly robot waving hello to a new user, with message bubbles in the background, digital illustration style."
    `;

    const response = await ai.models.generateContent({
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
              customizedScript: { type: Type.STRING },
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
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TextGenerationResponse;
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
    outputFormat: string,
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
        outputFormat
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