'use strict';

import interwikiMap from './interwikiMap';

const LangKey = 'lacmus-lang';

export default function interwikiSelector() {
   const $interwiki = $('<select>').change(onChanged);
   let inited = false;

   function onChanged() {
      localStorage.setItem(LangKey, $interwiki.val());
   }

   return {
      get element() {
         return $interwiki;
      },
      async init() {
         if (inited) return;

         $interwiki.chosen();
         
         const interwikis = await interwikiMap();
         const selected = localStorage.getItem(LangKey);
         
         $interwiki.empty();
         for (let [ prefix, language ] of interwikis) {
            $interwiki.append(
               $('<option>')
                  .attr('selected', prefix === selected)
                  .text(`${prefix}: ${language}`)
                  .val(prefix)
            );
         }
         
         $interwiki.data('chosen').results_build();
         $interwiki.data('chosen').container.css({ width: '' });
         inited = true;
      },
      val() {
         return $interwiki.val();
      },
   };
}
