
import React from 'react';

const LegalContent: React.FC = () => {
    return (
        <div className="space-y-6 text-gray-300 prose prose-invert prose-p:text-gray-400 prose-h2:text-white prose-h3:text-gray-200">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Главный принцип: Всё происходит на вашем компьютере
                </h2>
                <p className="text-gray-400 mt-2">
                    Это приложение работает исключительно в вашем браузере. Ваши файлы, API-ключи и любая другая информация не загружаются на наши серверы и не передаются третьим лицам (за исключением прямого запроса к API Google, который делаете вы сами через свой ключ).
                </p>
            </div>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Политика конфиденциальности: Ваша информация остаётся вашей</h2>
                
                <h3 className="text-lg font-semibold">Какие данные собираются?</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>API-ключ Google Gemini:</strong> Приложение запрашивает его, чтобы от вашего имени отправлять запросы к искусственному интеллекту Google.</li>
                    <li><strong>Содержимое ваших файлов:</strong> Приложение читает ваши файлы для анализа контента и адаптации сценария.</li>
                </ul>

                <h3 className="text-lg font-semibold">Как и где хранятся данные?</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>API-ключ:</strong> Сохраняется в <code>localStorage</code> вашего браузера. Это безопасное хранилище на вашем компьютере, к которому есть доступ только у вас. Ключ никогда не виден разработчикам.</li>
                    <li><strong>Файлы:</strong> Ваши файлы обрабатываются "на лету" в оперативной памяти браузера. Они не сохраняются нигде, кроме как в итоговом файле, который вы сами скачиваете на свой компьютер.</li>
                </ul>
                <div className="p-4 bg-gray-900/50 border-l-4 border-purple-500 rounded-r-lg">
                    <p className="font-bold text-white">Ключевой вывод:</p>
                    <p>Мы, как разработчики, не имеем доступа ни к вашему API-ключу, ни к содержимому ваших файлов. Вся работа происходит на вашей стороне, что обеспечивает максимальный уровень конфиденциальности.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Условия использования: Разграничение ответственности</h2>
                
                <h3 className="text-lg font-semibold">Приложение "Как есть" ("As Is")</h3>
                <p>Вы получаете инструмент в том виде, в котором он есть. Разработчики не дают гарантий, что он будет работать идеально без ошибок или удовлетворять абсолютно все ваши потребности.</p>

                <h3 className="text-lg font-semibold">Ответственность за API-ключ</h3>
                <p>Поскольку вы используете свой собственный ключ от Google Gemini, вся ответственность за его использование (включая соблюдение правил Google и потенциальную оплату) лежит на вас.</p>
                
                <h3 className="text-lg font-semibold">Качество работы ИИ</h3>
                <p>Приложение использует сторонний сервис (Google Gemini). Качество и релевантность предложенных имён не могут гарантироваться разработчиками приложения.</p>

                <h3 className="text-lg font-semibold">Ограничение ответственности</h3>
                <p>Разработчики не несут ответственности за возможные убытки (например, потерю данных или времени) в результате использования приложения. Вы используете его на свой страх и риск.</p>
            </section>
        </div>
    );
};

export default LegalContent;
