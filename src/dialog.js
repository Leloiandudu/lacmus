'use strict';

export default function dialog(d, params) {
   $(d).dialog(Object.assign({}, {
      dialogClass: 'lacmus-dialog',
   }, params, {
      open() {
         $(d).css({
            display: '',
            padding: '0.5em 0',
            overflow: 'visible',
         });
         $(d).dialog('widget').css({
            overflow: 'visible'
         });

         params.open && params.open();
      },

      // workaround: stop dialog from resetting its position to absolute on resizing
      resizeStart: e => {
         $(e.target).dialog('widget').css('position', '');
         params.resizeStart && params.resizeStart(e);
      },
   }));
};
