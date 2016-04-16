'use strict';

import storage from './storage';

export default function dialog(d, params, key) {
   const size = {};

   if (key) {
      key = 'lacmus-dialog-' + key;
      size.width = storage.get(key + '-width', params.width);
      size.height = storage.get(key + '-height', params.height);
   }

   $(d).dialog(Object.assign({}, {
      dialogClass: 'lacmus-dialog',
   }, params, size, {
      open() {
         $(d).css({
            display: '',
            padding: '0.5em 0',
            overflow: 'visible',
         });
         $(d).dialog('widget').css({
            overflow: 'visible',
            position: '',
            right: 'auto', // fix for RTL wikis
         });

         params.open && params.open();
      },

      // workaround: stop dialog from resetting its position to absolute on resizing
      resizeStart: (e, ui) => {
         $(e.target).dialog('widget').css('position', '');
         params.resizeStart && params.resizeStart(e, ui);
      },

      resizeStop: (e, ui) => {
         storage.set(key + '-width', ui.size.width);
         storage.set(key + '-height', ui.size.height);
         params.resizeStop && params.resizeStop(e, ui);
      }
   }));
};
