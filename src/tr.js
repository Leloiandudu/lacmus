'use strict';

import MwApi from './mwApi';
import labels from './translations.csv';

export default function tr(key, lang) {
   const item = labels[key];
   lang = lang || MwApi.getUserLanguage();
   return item && (item[lang] || item['en']);
}
