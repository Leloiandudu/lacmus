'use strict';
const through = require('through');

module.exports = function transform(condFn, transFn) {
   return function(file) {
      if (!condFn(file))
         return through();

      var data = '';
      return through(write, end);

      function write(buf) { data += buf }
      function end() {
         this.queue(transFn(data));
         this.queue(null);
      }
   }
};
