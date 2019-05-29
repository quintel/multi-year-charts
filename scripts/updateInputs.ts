import { writeFile } from 'fs';
import { env } from 'process';

import { config } from 'dotenv';
import axios from 'axios';

interface Input {
  key: string;
  unit: string;
  name: string;
}

interface Slide {
  path: string[];
  input_elements: Input[];
}

config({ silent: true });

const endpoint = env.REACT_APP_ETMODEL_URL;
const url = `${endpoint}/input_elements/by_slide`;

if (!endpoint) {
  console.error('No REACT_APP_ETEMODEL_URL defined; do you have a .env file?');
  process.exit(1);
}

/**
 * Fetches input definitions from a URL, returning a Promise which yields the
 * parsed JSON data.
 */
const fetchInputs = async (url: string, locale: string): Promise<Slide[]> => {
  const res = await axios.get(url, { headers: { 'Accept-Language': locale } });
  return res.data;
};

/**
 * Removes HTML elements from a string.
 */
const removeHTMLFromString = (str: string) => str.replace(/<\/?[^>]*>/g, '');

/**
 * Removes HTML elements from an input name.
 */
const removeHTMLFromInput = (input: Input) => {
  const newInput = { ...input };
  newInput.name = removeHTMLFromString(newInput.name);

  return newInput;
};

/**
 * Receives the data from ETEngine and removes any HTML elements from paths and
 * input names.
 */
const removeHTML = (data: Slide[]) => {
  return data.map(slide => {
    return {
      path: slide.path.map(removeHTMLFromString),
      // eslint-disable-next-line @typescript-eslint/camelcase
      input_elements: slide.input_elements.map(removeHTMLFromInput)
    };
  });
};

['en', 'nl'].forEach(locale => {
  fetchInputs(url, locale).then(data => {
    writeFile(
      `src/data/inputs/${locale}.json`,
      JSON.stringify(removeHTML(data), null, 2),
      err => {
        console.log(err || `Saved inputs for ${locale}`);
      }
    );
  });
});
