'use strict';

import MwApi from './mwApi';
import tr from './tr';
import interwikiSelector from './interwikiSelector';
import dialog from './dialog';

export default function colorer() {
   if (!MwApi.isViewing()) {
      return false;
   }

   mw.util.addPortletLink('p-cactions', '#', tr('colorerTitle')).addEventListener('click', function(ev) {
      ev.preventDefault();
      showDialog();
   });

   return true;
};

function getOrAdd(map, key, fn) {
   if (map.has(key))
      return map.get(key);

   const value = fn();
   map.set(key, value);
   return value;
};

function createDialog(onClose, onShow, onToggle) {
   const $list = $('<ul>');
   const $interwiki = interwikiSelector();
   const $loader = $('<div>').addClass('lacmus-loader-container').append($('<div>').addClass('lacmus-loader'));
   const $toggle = $('<input>').attr('type', 'checkbox').change(e => onToggle());

   const $dialog = $('<div>').addClass('lacmus').append(
      $('<div>').append(
         $('<div>').append(
            $interwiki.element,
            $('<button>').text(tr('show')).button().click(function() {
               $list.hide();
               $loader.show();
               onShow($interwiki.val());
            })
         ),
         $('<div>').append(
            $('<label>').append(
               $toggle,
               $('<span>').text(tr('toggle'))
            )
         )
      ),
      $loader.hide(),
      $list
   );

   dialog($dialog, {
      height: 400,
      title: tr('colorerTitle'),
      close() {
         $list.empty();
         $loader.hide();
         onClose();
      },
   });

   $interwiki.init();

   return {
      setLinks(list, onClick) {
         $list.empty().append(list.map(item => $('<li>').append(
            $('<span>').append(
               $('<a>')
                  .text(item.title)
                  .attr('title', item.title)
                  .attr('href', item.href)
            ),
            item.elements.map((e, i) =>
               $('<a>').text(item.elements.length === 1 ? '↑' : (i + 1)).click(function() {
                  $dialog.find('.lacmus-highlighted').removeClass('lacmus-highlighted');
                  onClick(e);
                  $(this).parent('li').addClass('lacmus-highlighted');
               })
            )
         )));

         $list.show();
         $loader.hide();
         $list.scrollTop(0);
      },
      open() {
         $dialog.dialog('open');
      },
      isOpen() {
         return $dialog.dialog('isOpen');
      },
      onlyMissing() {
         return $toggle.prop('checked');
      }
   }
};

function removeLinks() {
   $('.lacmus-link, .lacmus-link-bad').removeClass('lacmus-link lacmus-link-bad');
};

let Dialog;
function showDialog() {
   if (!Dialog)
      init();
   else
      Dialog.open();
};

async function init() {
   let Links;
   let IwLinks;
   let Lang;

   const api = new MwApi();
   Dialog = createDialog(removeLinks, onShow, showLinks);

   const urlRegex = /^\/wiki\/(.*?)(#.*)?$/

   async function onShow(lang) {
      removeLinks();
      Lang = lang;

      Links = new Map();
      $('#mw-content-text a').each((i, e) => {
         const url = urlRegex.exec($(e).attr('href'));
         if (!url) return;
         const title = decodeURIComponent(url[1]).replace(/_/g, ' ');
         Links.set(e, title);
      });
      IwLinks = await api.getInterLinks([...new Set(Links.values())], lang);
      if (Dialog.isOpen())
         showLinks();
   };

   function showLinks() {
      const onlyMissing = Dialog.onlyMissing();
      const foundLinks = new Map();

      for (var [e, title] of Links) {
         const has = IwLinks.has(title);
         $(e).addClass(has ? 'lacmus-link' : 'lacmus-link-bad');

         if (has ? !onlyMissing : onlyMissing) {
            getOrAdd(foundLinks, onlyMissing ? title : IwLinks.get(title).title, () => []).push(e);
         }
      }

      const linksSorted = [...foundLinks.keys()];
      linksSorted.sort();

      Dialog.setLinks(linksSorted.map(k => ({
         title: k,
         href: onlyMissing ? null : MwApi.getCrossWikiUrl(Lang, IwLinks.get(k).iwtitle),
         elements: foundLinks.get(k),
      })), highlight);
   };

   function highlight(link) {
      $('.lacmus-highlighted').removeClass('lacmus-highlighted');

      for(let box of $(link).parents('.collapsible').get()) {
         if ($(box).find('> tbody > tr:last-child').css('display') === 'none') {
            if (window.collapseTable) {
               const id = $(box).attr('id').substring('collapsibleTable'.length);
               collapseTable(id);
            } else {
               $(box).find('> tbody > tr:first-child a[id^=collapseButton]').click();
            }
         }
      }

      link.scrollIntoView();
      $(link).addClass('lacmus-highlighted');
   }
};
