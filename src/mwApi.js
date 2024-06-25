'use strict';

import pkg from './../package.json';

export default function MwApi(url) {
   const Api = new mw.Api({
      ajax: {
         headers: { "Api-User-Agent": `${pkg.name}/${pkg.version}` },
         url: url ? `${url}?origin=${window.location.origin}` : mw.util.wikiScript('api'),
      }
   });

   function mwApi(params) {
      return new Promise(function (resolve, reject) {
         const data = {
            format: "json",
            formatversion: "2"
         };

         Api.post(Object.assign(data, params)).done(resolve).fail(reject);
      });
   };

   this.getInterLinks = async function getInterLinks(links, lang) {
      async function query(links) {
         const inters = new Map();
         const args = {
            action: 'query',
            titles: links.join('|'),
            redirects: '',
            prop: 'langlinks',
            lllang: lang,
         };


         for (;;) {
            const results = await mwApi(args);
         
            const redirects = new Map();
            if (results.query.redirects) {
               for (let r of results.query.redirects) {
                  redirects.set(r.to, r.from);
               }
            }

            const normalized = new Map();
            if (results.query.normalized) {
               for (let n of results.query.normalized) {
                  normalized.set(n.to, n.from);
               }
            }

            for (let page of results.query.pages) {
               if (page.langlinks) {
                  const iwtitle = page.langlinks[0].title; 
                  const title = normalized.get(page.title) || page.title;

                  inters.set(title, { iwtitle, title });
                  if (redirects.has(title))
                     inters.set(redirects.get(title), { iwtitle, title });
               }
            }

            if (!results.continue)
               break;
            Object.assign(args, results.continue);
         }
         return inters;
      }

      const promises = [];
      for(let i = 0; i < links.length; i += 50) {
         promises.push(query(links.slice(i, i + 50)));
      }

      const inters = new Map();
      for (let it of await Promise.all(promises)) {
         for (let [key, value] of it) {
            inters.set(key, value);
         }
      }

      return inters;
   };

   this.getInterWikis = async function getInterWikis() {
      const result = await mwApi({
         action: 'query',
         meta: 'siteinfo',
         siprop: 'interwikimap',
      });

      const list = new Map();

      for (let link of result.query.interwikimap.filter(x => x.local && x.language)) {
         if (link.localinterwiki) {
            list.current = link.prefix;
         } else {
            list.set(link.prefix, link.language);
         }
      }

      return list;
   };
};

MwApi.getUserLanguage = function getUserLanguage() {
   return mw.config.get('wgUserLanguage');
};

MwApi.getCrossWikiUrl = function getCrossWikiUrl(prefix, title) {
   return `https://${prefix}.wikipedia.org/wiki/${title}`;
};

MwApi.getCrossWikiApiUrl = function getCrossWikiUrl(prefix) {
   return `https://${prefix}.wikipedia.org/w/api.php`;
};

MwApi.isViewing = function isViewing() {
   return mw.config.get('wgIsArticle');
};

MwApi.isEditing = function isEditing() {
   return [ 'edit', 'submit' ].indexOf(mw.config.get('wgAction')) !== -1;
};
