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

	// Get the gist backup, if any
	const get = await fetch(`/${code}/api`);

	if (get.status >= 500) {
		return {
			status: 500,
			reason: 'Failed to fetch get gist'
		};
	}

	type files = {
		[key: string]: { content: string };
	};

	const project: { id: string; files: files } =
		get.status === 200 ? await get.json() : { id: '', files: {} };

	// If there is no project, create one
	if (!project?.id) {
		const content = `¡Hola ${username}!\n\n${README}`;
		project.files['README.md'] = { content };

		const request = await fetch(`/${code}/api`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ files: project.files })
		});

		if (request.status >= 400) {
			return {
				status: 500,
				reason: 'Failed to fetch create gist'
			};
		}

		const new_id = await request.text();

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
		if (!project.files) {
			return {
				status: 500,
				reason: 'Failed to get gist'
			};
		}

		// TODO: Review this
		for (const [filename, file] of Object.entries(project.files)) {
			project.files[filename] = { content: file?.content ?? '' };
		}
	}

	return {
		status: 200,
		...project,
		username
	};
};
