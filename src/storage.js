'use strict';

function parse(str) {
   try {
      return str && JSON.parse(str);
   } catch (e) {
      return str;
   }
}

export default {
   get(key, defaultValue) {
      return parse(localStorage.getItem(key)) || defaultValue;
   },
   set(key, value) {
      return localStorage.setItem(key, JSON.stringify(value));
   },
};
