import React from 'react';

const InstructionStep: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-full flex items-center justify-center font-bold text-lg">
            {number}
        </div>
        <div>
            <h4 className="text-lg font-semibold text-white">{title}</h4>
            <p className="text-gray-400 mt-1">{children}</p>
        </div>
    </div>
);


const InstructionsModal: React.FC = () => {
    return (
        <div className="space-y-6 text-gray-300">
            <p>
                Добро пожаловать в Кастомизатор сценариев! Этот инструмент поможет вам создать уникального Telegram-бота, адаптировав существующий сценарий или придумав новый с нуля.
            </p>

            <div className="space-y-5">
                <InstructionStep number={1} title="Выберите режим">
                    <strong>Кастомизация:</strong> Загрузите ваш готовый сценарий (в формате .txt, .md или n8n .json), чтобы изменить его тон, стиль и добавить вашу уникальную историю. <br/>
                    <strong>Создание с нуля:</strong> У вас есть только идея? Опишите ее, и ИИ сгенерирует полный сценарий и брендинг для вашего будущего бота.
                </InstructionStep>

                <InstructionStep number={2} title="Загрузите данные">
                    В зависимости от режима, загрузите файл со сценарием или подробно опишите вашу идею. Вы также можете добавить "вашу историю" — уникальный контекст о вашей компании или продукте, который ИИ органично вплетет в сценарий.
                </InstructionStep>
                
                <InstructionStep number={3} title="Настройте «голос» бота">
                    Используйте выпадающие списки, чтобы точно определить характер вашего бота. Выберите стиль общения, целевую аудиторию, формальность и даже частоту использования эмодзи. Каждый параметр влияет на конечный результат.
                </InstructionStep>

                <InstructionStep number={4} title="Сгенерировать и получите результат">
                    Нажмите кнопку "Сгенерировать". Через несколько мгновений вы получите полный пакет:
                    <ul className="list-disc list-inside mt-2 text-gray-400 space-y-1">
                        <li><strong>Профиль бота:</strong> Готовое описание и промпт для генерации аватара.</li>
                        <li><strong>Адаптированный сценарий:</strong> Полностью переписанный текст в выбранном вами формате.</li>
                        <li><strong>Визуальные промпты:</strong> Идеи для иллюстраций к ключевым моментам вашего сценария.</li>
                    </ul>
                </InstructionStep>
            </div>

            <div className="pt-4 border-t border-gray-700 text-center text-sm text-gray-500">
                <p>Экспериментируйте с настройками, чтобы добиться идеального результата!</p>
            </div>
        </div>
    );
};

export default InstructionsModal;