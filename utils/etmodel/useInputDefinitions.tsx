import { useEffect, useState } from 'react';
import useCurrentLocale from '../../utils/useCurrentLocale';

type SlideData = {
  path: string[];

  input_elements: {
    key: string;
    unit: string;
    name: string;
  }[];
};

export type InputData = SlideData[];

let promise: Promise<InputData> | null = null;
let lastLocale: string | null = null;

/**
 * Fetches the input definitions from the API.
 *
 * It will only fetch the definitions once for the current locale, and then cache the result.
 */
async function fetchInputs(locale: string) {
  if (lastLocale !== locale) {
    promise = null;
  }

  lastLocale = locale;

  if (promise) {
    return promise;
  }

  promise = new Promise((resolve) => {
    fetch(process.env.NEXT_PUBLIC_ETMODEL_URL + '/input_elements/by_slide', {
      method: 'GET',
      headers: { 'Accept-Language': locale },
    })
      .then((response) => response.json())
      .then(resolve);
  });

  return promise;
}

export default function useInputDefinitions() {
  const locale = useCurrentLocale();
  const [definitions, setDefinitions] = useState<InputData | null>(null);

  useEffect(() => {
    const fetcher = async () => {
      setDefinitions(await fetchInputs(locale));
    };

    fetcher();
  }, [locale]);

  return definitions;
}
