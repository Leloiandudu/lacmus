'use strict';

function toPromise(hook) {
   return new Promise(function(resolve) {
      hook.add(resolve);
   });
};

export function isNewToolbar() {
   return mw.user.options.get('usebetatoolbar') === 1;
};

export function addOldToolbarButton(cb, title, icon) {
   let $toolbar = $('#gadget-toolbar');
   if (!$toolbar.length) {
      $toolbar = $('#toolbar');
   }
   return $('<div>')
      .addClass('mw-toolbar-editbutton')
      .attr('title', title)
      .css({
         width: 23,
         backgroundImage: 'url("//upload.wikimedia.org/wikipedia/commons/e/ec/Button_base.png")',
      })
      .append($('<div>').css({
         backgroundImage: `url("${icon}")`,
         backgroundSize: 18,
         backgroundPosition: 'center',
         backgroundRepeat: 'no-repeat',
         width: '100%',
         height: '100%',
      }))
      .appendTo($toolbar)
      .on('click', cb);
};

export async function addNewToolbarSection(id, title) {
   await toPromise(mw.hook('wikiEditor.toolbarReady'));

   $('#wpTextbox1').wikiEditor('addToToolbar', {
      'sections': {
         [id]: {
            type: 'toolbar',
            label: title,
            groups: {
               [id]: {}
            }
         }
      }
   });

   return $(`#wikiEditor-ui-toolbar div[rel="${id}"].section div[rel="${id}"].group`).removeClass('empty');
};

function addNewToolbarButton() {
   if ($('#wikiEditor-ui-toolbar div[rel="main"].section div[rel="gadgets"].group').length === 0) {
      $('#wpTextbox1').on('wikiEditor-toolbar-doneInitialSections', addNewToolbarButton);
      return;
   }

   $('#wpTextbox1').wikiEditor('addToToolbar', {
      'section': 'main',
      'group': 'gadgets',
      'tools': {
         [id]: {
            label: title,
            type: 'button',
            icon: newIcon,
            action: { type: 'callback', execute: cb },
         },
      }
   });
};
