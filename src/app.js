'use strict';
import MwApi from './mwApi';
import colorer from './colorer';
import replacer from './replacer';
import css from './styles.less';

window.RLQ.push(function() { mw.loader.using([ 'mediawiki.api', 'mediawiki.util', 'jquery.ui.dialog', 'jquery.ui.button', 'jquery.chosen', 'user.options', 'jquery.textSelection' ], function () {
   const modules = [
      colorer(),
      replacer(),
   ];

   if (modules.some(x => x)) {
      mw.util.addCSS(css);
   }
})});
