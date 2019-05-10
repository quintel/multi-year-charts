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

    Object.keys(values).forEach(key => {
      const re = new RegExp(`{${key}}`, 'g');
      message = message.replace(re, values[key]);
    });

    return message;
  }

  return key;
};
