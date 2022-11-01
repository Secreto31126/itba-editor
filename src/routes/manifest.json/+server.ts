import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response('Hello world!');
};

// "shortcuts": [
//     {
//       "name": "How's weather today?",
//       "short_name": "Today",
//       "description": "View weather information for today",
//       "url": "/today?source=pwa",
//       "icons": [
//         {
//           "src": "/icons/logo_192.png",
//           "sizes": "192x192"
//         }
//       ]
//     },
//     {
//       "name": "How's weather tomorrow?",
//       "short_name": "Tomorrow",
//       "description": "View weather information for tomorrow",
//       "url": "/tomorrow?source=pwa",
//       "icons": [
//         {
//           "src": "/icons/logo_192.png",
//           "sizes": "192x192"
//         }
//       ]
//     }
//   ],