import type { RequestHandler } from './$types';

import manifest from '$lib/manifest.json?raw';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json(manifest);
};
