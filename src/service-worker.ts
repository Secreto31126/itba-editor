/// <reference lib="webworker" />

import { build, files, timestamp } from '$service-worker';
console.log('timestamp', timestamp);

const worker = self as unknown as ServiceWorkerGlobalScope;
const FILES = `cache${timestamp}`;

// `build` is an array of all the files generated by the bundler,
// `files` is an array of everything in the `static` directory
const to_cache = build.concat(files);
const staticAssets = new Set(to_cache);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(FILES)
			.then((cache) => cache.addAll(to_cache))
			.then(() => {
				worker.skipWaiting();
			})
	);
});