import { useContext } from 'react';
import LocaleContext, { TranslateFunc } from './LocaleContext';

export default function useTranslate(): TranslateFunc {
  const { translate } = useContext(LocaleContext);
  return translate;
}
