
export const PIN_AUTH_SERVICE_URL = 'https://pin-auth-service2.vercel.app/api/validate';

export const WRITING_STYLES = [
  { value: 'Helpful and Professional', label: 'Полезный и профессиональный' },
  { value: 'Friendly and Conversational', label: 'Дружелюбный и разговорный' },
  { value: 'Empathetic and Reassuring', label: 'Эмпатичный и поддерживающий' },
  { value: 'Persuasive and Sales-oriented', label: 'Убедительный и продающий' },
  { value: 'Playful and Humorous', label: 'Игривый и с юмором' },
  { value: 'Direct and Action-oriented', label: 'Прямой и ориентированный на действие' },
  { value: 'Elegant and Refined', label: 'Элегантный и изысканный' },
];

export const TARGET_AUDIENCES = [
  { value: 'General Audience', label: 'Общая аудитория' },
  { value: 'Teenagers', label: 'Подростки' },
  { value: 'Young Professionals (20-30s)', label: 'Молодые специалисты' },
  { value: 'Parents', label: 'Родители' },
  { value: 'Tech Enthusiasts', label: 'Техноэнтузиасты' },
  { value: 'Business Owners', label: 'Владельцы бизнеса' },
  { value: 'Seniors', label: 'Пожилые люди' },
];

export const BOT_GOALS = [
  { value: 'Lead Generation', label: 'Генерация лидов' },
  { value: 'Customer Support', label: 'Поддержка клиентов' },
  { value: 'User Engagement and Entertainment', label: 'Развлечение' },
  { value: 'E-commerce Sales', label: 'Продажи в e-commerce' },
  { value: 'Information Delivery', label: 'Предоставление информации' },
  { value: 'Onboarding New Users', label: 'Онбординг новых пользователей' },
];

export const SALES_FRAMEWORKS = [
  { value: 'None', label: 'Не использовать' },
  { value: 'AIDA', label: 'AIDA (Внимание, Интерес, Желание, Действие)' },
  { value: 'PAS', label: 'PAS (Проблема, Агитация, Решение)' },
  { value: 'FAB', label: 'FAB (Свойства, Преимущества, Выгоды)' },
  { value: 'Storytelling', label: 'Сторителлинг' },
];

export const FORMALITY_LEVELS = [
    { value: 'Neutral', label: 'Нейтральный' },
    { value: 'Very Formal (Corporate)', label: 'Очень формальный' },
    { value: 'Casual (Friendly)', label: 'Неформальный' },
    { value: 'Very Casual (with slang/memes)', label: 'Очень неформальный (со сленгом)' },
];

export const EMOJI_FREQUENCIES = [
    { value: 'Moderate (Recommended)', label: 'Умеренная' },
    { value: 'None', label: 'Без эмодзи' },
    { value: 'Minimal (Only for emphasis)', label: 'Минимальная' },
    { value: 'Frequent (Expressive)', label: 'Частая' },
];

export const RESPONSE_LENGTHS = [
    { value: 'As in original', label: 'Как в оригинале' },
    { value: 'Medium (Balanced)', label: 'Средняя' },
    { value: 'Short and Concise', label: 'Короткая и лаконичная' },
    { value: 'Detailed and Explanatory', label: 'Подробная и объясняющая' },
];

export const LANGUAGE_COMPLEXITIES = [
    { value: 'Standard (Grade 8)', label: 'Стандартная' },
    { value: 'Simple (Grade 5)', label: 'Простая (легко читаемая)' },
    { value: 'Advanced (University level)', label: 'Продвинутая (сложная лексика)' },
];

export const OUTPUT_FORMATS = [
  { value: 'Markdown', label: 'Markdown (.md)' },
  { value: 'n8n JSON', label: 'n8n JSON' },
  { value: 'JSON', label: 'JSON' },
  { value: 'Text', label: 'Обычный текст (.txt)' },
];

export const AI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Быстрый)' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Мощный)' },
];
