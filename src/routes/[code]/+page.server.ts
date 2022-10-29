import type { PageServerLoad } from './$types';

import { redirect } from '@sveltejs/kit';
import { Octokit } from '@octokit/rest';
import README from '$lib/README.md?raw';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
	// Get the token from the cookie
	const token: string = cookies.get('token') ?? '';
	const { code } = params;

	// If there is no token, redirect to the login page
	if (!token) throw redirect(302, `/${code}/login`);

	// Log in and get the user's data
	const octokit = new Octokit({ auth: token });
	const github = await octokit.users.getAuthenticated();
	// Maybe the token doesn't have permision to get the username (I don't think it's possible)
	const username: string = github.data.login ?? '(unknown username)';

	const files: {
		[key: string]: { content: string };
	} = {};

	// Get the gist backup, if any
	const get = await fetch(`/${code}/api`);

	if (get.status >= 500) {
		return {
			status: 500,
			reason: 'Failed to fetch get gist'
		};
	}

	const project: { id: string } = get.status === 200 ? await get.json() : { id: '' };
	console.log('/api GET body', project);

	// If there is no project, create one
	if (!project?.id) {
		const content = `¡Hola ${username}!\n\n${README}`;

		files['README.md'] = { content };

		const request = await fetch(`/${code}/api`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ files })
		});

		if (request.status >= 400) {
			return {
				status: 500,
				reason: 'Failed to fetch create gist'
			};
		}

		const new_id = await request.text();
		console.log('/api POST', new_id);

		// If creation fails, display an error
		if (!new_id) {
			return {
				status: 500,
				reason: 'Failed to create gist'
			};
		}

		project.id = new_id;

		// No need to GET the gist, we just created it
	} else {
		const list = await octokit.gists.get({
			gist_id: project.id
		});

		if (!list.data.files) {
			return {
				status: 500,
				reason: 'Failed to get gist'
			};
		}

		for (const [filename, file] of Object.entries(list.data.files)) {
			files[filename] = { content: file?.content ?? '' };
		}
	}

	return {
		status: 200,
		username,
		id: project.id,
		files
	};
};
