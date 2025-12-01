import { I18n } from 'i18n-js';
import { translations } from './translations';

const i18n = new I18n(translations);
i18n.enableFallback = true;

export const setI18nConfig = (language) => {
  i18n.locale = language || 'en';
};

export const t = (key, options) => i18n.t(key, options);
