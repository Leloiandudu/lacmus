'use strict';

import MwApi from './mwApi';

let map;

export default async function interwikiMap() {
	if (!map) {
		map = await new MwApi().getInterWikis();
	};
	return map;
}
