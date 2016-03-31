'use strict';

export default {
   get(key, defaultValue) {
      return localStorage.getItem(key) || defaultValue;
   },
   set(key, value) {
      return localStorage.setItem(key, value);
   },
};
