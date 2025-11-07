import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedAssets, TextGenerationResponse, ScriptBlockImage } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const generateTextContent = async (
    referenceScript: string,
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
    
    const prompt = `
        Ты — эксперт по написанию сценариев для чат-ботов Telegram и специалист по брендингу. Твоя задача — проанализировать предоставленный сценарий и сгенерировать полный пакет материалов на основе настроек пользователя.

        **Входные данные:**

        1.  **Исходный сценарий:**
            \`\`\`
            ${referenceScript}
            \`\`\`
        2.  **История пользователя для интеграции (если есть):**
            \`\`\`
            ${userStory || 'Дополнительная история не предоставлена.'}
            \`\`\`
        3.  **Настройки:**
            *   **Стиль написания:** ${writingStyle}
            *   **Целевая аудитория:** ${targetAudience}
            *   **Основная цель:** ${botGoal}
            *   **Уровень формальности:** ${formality}
            *   **Частота эмодзи:** ${emojiFrequency}
            *   **Длина ответов:** ${responseLength}
            *   **Сложность языка:** ${languageComplexity}
            *   **Требуемый формат вывода сценария:** ${outputFormat}

        **Твоя задача:**

        Сгенерируй JSON-объект со следующей структурой. Не добавляй никакого текста за пределами самого JSON-объекта.

        \`\`\`json
        {
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

        -   **description:** Сделай его привлекательным и соответствующим цели и тону бота.
        -   **capabilities:** Будь прямым и ясным. Начинай каждый пункт с глагола действия.
        -   **customizedScript:** Это самая важная часть. Перепиши весь сценарий, а не просто добавляй комментарии. Тон, лексика, структура предложений, использование эмодзи и длина ответов должны идеально отражать ВСЕ выбранные настройки.
            -   **Форматирование:** Используй Markdown, совместимый с Telegram (*жирный текст* , _курсив_ , __подчеркнутый__), для улучшения читаемости. Используй логические отступы и пустые строки для разделения сообщений.
            -   **Формат вывода:** Сгенерируй 'customizedScript' СТРОГО в формате "${outputFormat}".
                -   **Markdown**: Верни весь сценарий как единую строку с Markdown-разметкой.
                -   **Text**: Верни сценарий как единую строку, но без какой-либо Markdown-разметки.
                -   **JSON**: Верни СТРОКУ, содержащую JSON-массив. Каждый элемент массива должен быть объектом вида \`{"message": "Текст сообщения здесь"}\`.
                -   **n8n JSON**: Верни СТРОКУ, содержащую JSON-массив. Каждый элемент массива представляет узел сообщения n8n и должен иметь формат \`{"text": "Текст сообщения", "buttons": [[{"text": "Текст кнопки", "callback_data": "data"}]]}\`. Если у сообщения нет кнопок, поле "buttons" должно быть пустым массивом \`[]\`.
        -   **scriptBlocks:** Определи 3-5 основных логических разделов в адаптированном сценарии. **Логический раздел — это группа сообщений, которая заканчивается предложением пользователю совершить действие (например, нажать на кнопки).** 'description' для каждого блока должен быть визуальным промптом, например: "Дружелюбный робот машет привет новому пользователю, на фоне видны облачка с сообщениями."
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
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
            required: ['description', 'capabilities', 'customizedScript', 'scriptBlocks']
          }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TextGenerationResponse;
};


const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const model = 'imagen-4.0-generate-001';
    const response = await ai.models.generateImages({
        model,
        prompt: `Создай визуально привлекательное, современное и дружелюбное изображение в стиле иконки для Telegram-бота. Изображение должно быть абстрактным или с маскотом, подходящим для маленькой картинки профиля. Концепция: ${prompt}`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateBotAssets = async (
    referenceScript: string,
    userStory: string,
    writingStyle: string,
    targetAudience: string,
    botGoal: string,
    formality: string,
    emojiFrequency: string,
    responseLength: string,
    languageComplexity: string,
    outputFormat: string,
    updateLoadingMessage: (message: string) => void
): Promise<GeneratedAssets> => {
    
    updateLoadingMessage('Анализ сценария и генерация текстового контента...');
    const textData = await generateTextContent(
        referenceScript, 
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

    updateLoadingMessage('Создание уникального изображения профиля...');
    const profilePictureUrl = await generateImage(textData.description);
    
    updateLoadingMessage(`Генерация изображений для ${textData.scriptBlocks.length} блоков сценария...`);
    const imagePromises = textData.scriptBlocks.map(block => 
        generateImage(block.description).then(imageUrl => ({
            blockTitle: block.title,
            imageUrl: imageUrl
        }))
    );
    const scriptBlockImages = await Promise.all(imagePromises);

    return {
        profilePictureUrl,
        description: textData.description,
        capabilities: textData.capabilities.join('\n'),
        customizedScript: textData.customizedScript,
        scriptBlockImages
    };
};