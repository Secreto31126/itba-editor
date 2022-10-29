import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { Octokit } from '@octokit/rest';
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { compare, hash } from 'bcryptjs';

// Get
export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const octokit = new Octokit({ auth: token });

	const gists = await octokit.gists.list();

	if (gists.status >= 400) throw error(500, 'Failed to get gists');

	type get = GetResponseDataTypeFromEndpointMethod<typeof octokit.gists.list>;
	let project: get | null = null;
	for (const gist of gists.data) {
		if (!gist.description) continue;
		if (await compare(params.code, gist.description)) {
			project = gist;
			break;
		}
	}

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
	const gist = await octokit.gists.create({
		files,
		public: true,
		description: await hash(code, 10)
	});

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
	const gist = await octokit.gists.update({
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
	const gist = await octokit.gists.update({
		gist_id: id,
		files: {
			[filename]: {}
		}
	});

	if (gist.status >= 400) throw error(500, 'Failed to update gist');

	return new Response('OK');
};
