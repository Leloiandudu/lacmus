'use strict';
import MwApi from './mwApi';

// TODO: generate from something more editable
const labels = {
   'colorerTitle': {
      en: 'Links with interwikis',
      ru: 'Ссылки с интервиками',
   },
   'replacerTitle':{
      en: 'Wikilinks translation',
      ru: 'Перевод вики-ссылок',
   },
   'show': {
      en: 'Show',
      ru: 'Показать',
   },
   'translate': {
      en: 'Translate',
      ru: 'Перевести',
   },
   'toggle': {
      en: 'without interwikis',
      ru: 'без интервик',
   },
   'source': {
      en: 'Source:',
      ru: 'Источник:',
   },
};

export default function tr(key, lang) {
   const item = labels[key];
   lang = lang || MwApi.getUserLanguage();
   return item && (item[lang] || item['en']);
}
