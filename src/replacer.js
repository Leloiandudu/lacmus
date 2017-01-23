'use strict';

import MwApi from './mwApi';
import tr from './tr';
import * as mwToolbar from './mwToolbar';
import interwikiSelector from './interwikiSelector';
import interwikiMap from './interwikiMap';
import dialog from './dialog';

export default function replacer() {
   if (!MwApi.isEditing()) {
      return false;
   }

   // starting async initialisation
   init();

   return true;
};

function getSelection(el) {
   const $textarea = $(el);
   const [ start, end ] = $textarea.textSelection('getCaretPosition', { startAndEnd: true });
   const text = $textarea.textSelection('getContents');

   return {
      get() { return start === end ? text : text.substring(start, end); },
      set(val) {
         if (start === end) {
            $textarea.val(val);
            $textarea.textSelection('setSelection', { start, end });
         } else {
            $textarea.val(text.substring(0, start) + val + text.substring(end));
            $textarea.textSelection('setSelection', { start, end: start + val.length });
         }
      },
   }
};

async function translateLinks(lang) {
   const LinksRegex = /\[\[([^\]\|]+)(?:\|(.+?))?\]\]/g;
   
   $('#wpTextbox1').focus();
   const selection = getSelection('#wpTextbox1');
   const text = selection.get();
   let res;
   const links = [];
   while((res = LinksRegex.exec(text))) {
      links.push({
         index: res.index + 2, // 2 for '[['
         title: res[1],
      });
   }

   const curLang = (await interwikiMap()).current;
   const url = MwApi.getCrossWikiApiUrl(lang);
   const interlinks = await new MwApi(url).getInterLinks(links.map(x => x.title), curLang);

   let result = '';
   let index = 0;
   for (var link of links) {
      if (interlinks.has(link.title)) {
         const iwtitle = interlinks.get(link.title).iwtitle;
         result += text.substring(index, link.index) + fixCase(iwtitle, link.title);
         index = link.index + link.title.length;
      }
   }
   result += text.substring(index);

   selection.set(result);
};

function fixCase(text, referenceText) {
   if (!text || !referenceText)
      return text;
   const ch = referenceText.charAt(0);
   if (ch === ch.toLowerCase()) {
      return text.charAt(0).toLowerCase() + text.substring(1);
   } else {
      return text;
   }
};

async function init() {
   const title = tr('replacerTitle');
   const icon = '//upload.wikimedia.org/wikipedia/commons/4/43/OOjs_UI_icon_language-ltr.svg';

   if (mwToolbar.isNewToolbar()) {
      const $toolbar = await mwToolbar.addNewToolbarSection('lacmus', title);
      const $interwiki = interwikiSelector();
      $toolbar.append(
         $('<span>').addClass('label').text(tr('source')),
         $interwiki.element,
         $('<a>')
            .addClass('tool-button')
            .attr('title', tr('translate'))
            .css({
               backgroundImage: `url("${icon}")`,
               backgroundPosition: 'center',
               marginLeft: 5,
               backgroundSize: 22,
            })
            .click(() => translateLinks($interwiki.val()))
      );
      $interwiki.init();
   } else {
      if (mwToolbar.isToolbarEnabled()) {
         await mwToolbar.addOldToolbarButton(showDialog, title, icon);
      } else {
         mw.util.addPortletLink('p-tb', '#', title).addEventListener('click', function(ev) {
            ev.preventDefault();
            showDialog();
         });
      }
   }
};

function createDialog() {
   const $interwiki = interwikiSelector();

   const $dialog = $('<div>').addClass('lacmus').append(
      $('<div>').append(
         $('<div>').append(
            $('<span>').addClass('label').text(tr('source')),
            $interwiki.element,
            $('<button>').text(tr('translate')).button().click(function() {
               $dialog.dialog('close');
               translateLinks($interwiki.val());
            })
         )
      )
   );

   dialog($dialog, {
      title: tr('colorerTitle'),
      minHeight: 0,
   }, 'replacer');

   $interwiki.init();

   return {
      open() {
         $dialog.dialog('open');
      },
   };
};

let Dialog;
function showDialog() {
   if (!Dialog) {
      Dialog = createDialog();
   } else {
      Dialog.open();
   }
};
