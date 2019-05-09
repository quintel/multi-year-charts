export default (
  key: string,
  messages: Record<string, string>
): string => {
  if (messages.hasOwnProperty(key)) {
    return messages[key];
  }

  return key;
};
