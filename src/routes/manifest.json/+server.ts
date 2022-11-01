import type { RequestHandler } from './$types';

import manifest from '$lib/manifest.json?raw';

export const GET: RequestHandler = async () => {
	return new Response(manifest);
};
