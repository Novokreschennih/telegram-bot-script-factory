
import React from 'react';

// Dummy implementation for i18n hook
export const useI18n = () => {
  const t = (key: string) => {
    // Simple translation logic for the known keys in PinValidation
    const translations: { [key: string]: string } = {
        'pinCodePage.title': 'Введите код доступа',
        'pinCodePage.subtitle': 'Для доступа к приложению требуется PIN-код.',
        'pinCodePage.placeholder': 'Код доступа',
        'pinCodePage.errorUsedOrNotFound': 'PIN-код не найден или уже был использован.',
        'pinCodePage.error': 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
        'pinCodePage.errorNetwork': 'Сетевая ошибка. Проверьте ваше подключение.',
        'pinCodePage.verifying': 'Проверка...',
        'pinCodePage.button': 'Продолжить',
    };
    return translations[key] || key;
  };
  return { t };
};
