import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { Octokit } from '@octokit/rest';

// Get
export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const octokit = new Octokit({ auth: token });
	const gist = await octokit.rest.gists.list();

	if (gist.status >= 400) throw error(500, 'Failed to get gists');

	const project = gist.data.find((gist) => gist.description === params.code);

	if (!project) throw error(404, 'Project not found');

	return new Response(JSON.stringify(project));
};

// Create
export const POST: RequestHandler = async ({ cookies, request, params }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const { files } = await request.json();
	const { code } = params;

	const octokit = new Octokit({ auth: token });
	const gist = await octokit.rest.gists.create({ files, public: true, description: code });

	if (gist.status >= 400) throw error(500, 'Failed to create gist');

	return new Response(gist.data.id);
};

// Update
export const PUT: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const { id, filename, content } = await request.json();

	if (!content || !filename || !id) throw error(400, 'Missing data');

	const octokit = new Octokit({ auth: token });
	const gist = await octokit.rest.gists.update({
		gist_id: id,
		files: {
			[filename]: { content }
		}
	});

	if (gist.status >= 400) throw error(500, 'Failed to update gist');

	return new Response('OK');
};

// Delete
export const DELETE: RequestHandler = async ({ cookies, request }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const { id, filename } = await request.json();

	if (!filename || !id) throw error(400, 'Missing data');

	const octokit = new Octokit({ auth: token });
	const gist = await octokit.rest.gists.update({
		gist_id: id,
		files: {
			[filename]: {}
		}
	});

	if (gist.status >= 400) throw error(500, 'Failed to update gist');

	return new Response('OK');
};
