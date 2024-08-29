import { TranslateFunc } from './LocaleContext';

/**
 * Given a translate function, returns a new function which namespaces all calls
 * to the original function.
 *
 * For example:
 *
 *    // Translation ID sent to the original translate function will be prefixed
 *    // with "series."
 *    const s = namespacedTranslate(translate, 'series')
 *
 *    s('final_demand') // => looks up "series.final_demand"
 */
export const namespacedTranslate = (
  translate: TranslateFunc,
  namespace: string
): TranslateFunc => {
  return (key: string, values: Record<string, string> = {}) => {
    const translated = translate(`${namespace}.${key}`, values);

    if (translated === `${namespace}.${key}`) {
      return key;
    }

    const processedTranslation = processHTML(translated);
    return processedTranslation;
  };
};

/**
 * Processes a translation string to ensure HTML tags or entities are rendered correctly.
 * This could involve escaping or handling HTML entities.
 */
const processHTML = (translation: string): string => {
  return translation.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};

/**
 * Provided a translation key and a record containing all the translation
 * strings, retrieves and formats a translation.
 *
 * Optional "values" may be interpolated into the string.
 *
 * @example Static translation
 *   translate('app.title', messages);
 *
 * @example Translation with interpolation
 *   translate('app.intro', messages, { user: user.name, year: config.year });
 */
export default (
  key: string,
  messages: Record<string, string>,
  values: Record<string, string> = {}
): string => {
  if (messages.hasOwnProperty(key)) {
    let message = '' + messages[key];

    Object.keys(values).forEach(valKey => {
      const re = new RegExp(`{${valKey}}`, 'g');
      message = message.replace(re, values[valKey]);
    });

    return processHTML(message);
  }

  return key;
};
