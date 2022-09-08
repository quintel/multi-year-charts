import { writeFile } from 'fs';
import { env } from 'process';

import { config } from 'dotenv';

config({ path: './.env.local', silent: true });

const endpoint = env.NEXT_PUBLIC_ETMODEL_URL;
const url = `${endpoint}/input_elements/by_slide`;

if (!endpoint) {
  console.error('No NEXT_PUBLIC_ETMODEL_URL defined; do you have a .env file?');
  process.exit(1);
}

/**
 * Fetches input definitions from a URL, returning a Promise which yields the
 * parsed JSON data.
 */
const fetchInputs = async (url, locale) => {
  const res = await fetch(url, { method: 'GET', headers: { 'Accept-Language': locale } });
  return await res.json();
};

/**
 * Removes HTML elements from a string.
 */
const removeHTMLFromString = (str) => str.replace(/<\/?[^>]*>/g, '');

/**
 * Removes HTML elements from an input name.
 */
const removeHTMLFromInput = (input) => {
  const newInput = Object.assign({}, input);
  newInput.name = removeHTMLFromString(newInput.name);
  return newInput;
};

/**
 * Receives the data from ETEngine and removes any HTML elements from paths and
 * input names.
 */
const removeHTML = (data) => {
  return data.map((slide) => {
    return {
      path: slide.path.map(removeHTMLFromString),
      input_elements: slide.input_elements.map(removeHTMLFromInput),
    };
  });
};

['en', 'nl'].forEach((locale) => {
  fetchInputs(url, locale).then((data) => {
    writeFile(`data/inputs/${locale}.json`, JSON.stringify(removeHTML(data), null, 2), (err) => {
      console.log(err || `Saved inputs for ${locale}`);
    });
  });
});
