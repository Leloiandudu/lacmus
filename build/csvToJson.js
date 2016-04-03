'use strict';

const transform = require('./transform');
const csv = require('csv-parse/lib/sync');

module.exports = transform(f => /\.csv$/.test(f), toJson);

function toJson(data) {
   const obj = {};

   const records = csv(data, { columns: true });
   for (var r of records) {
      const key = r.key;
      delete r.key;
      obj[key] = r;
   }

   return "module.exports = " + JSON.stringify(obj) + ";";
};
