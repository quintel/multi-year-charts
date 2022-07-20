import { useContext } from 'react';
import LocaleContext, { TranslateFunc } from './LocaleContext';

export default function useTranslate(): string {
  const { currentLocale } = useContext(LocaleContext);
  return currentLocale;
}
