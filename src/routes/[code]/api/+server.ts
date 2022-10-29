import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import type { RequestHandler } from './$types';

import { Octokit } from '@octokit/rest';
import { compare, hash } from 'bcryptjs';
import { error, json } from '@sveltejs/kit';
import { createKey, encrypt, decrypt } from '$lib/server/encryp';

// Get
export const GET: RequestHandler = async ({ cookies, params }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const { code } = params;

	const octokit = new Octokit({ auth: token });
	const gists = await octokit.gists.list();

	if (gists.status >= 400) throw error(500, 'Failed to get gists');

	let project: GetResponseDataTypeFromEndpointMethod<typeof octokit.gists.get> | null = null;
	for (const gist of gists.data) {
		if (!gist.description) continue;
		if (await compare(code, gist.description)) {
			const request = await octokit.gists.get({
				gist_id: gist.id
			});

			project = request.data;
			break;
		}
	}

	if (!project) throw error(404, 'Project not found');

	// Decrypt all the files' contents
	for (const file in project.files) {
		// Thanks TypeScript...
		const ptr = project.files?.[file];
		if (!ptr?.content) continue;
		try {
			const data = JSON.parse(ptr.content);
			if (!data.iv || !data.content) throw new Error('Missing data');
			ptr.content = decrypt(data, createKey(code));
		} catch (e) {
			console.error('Corrupted data detected', e);
			throw error(500, 'Failed to decrypt project');
		}
	}

	return json({
		id: project.id,
		files: project.files
	});
};

// Create
export const POST: RequestHandler = async ({ cookies, request, params }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const { files } = await request.json();
	const { code } = params;

	for (const file in files) {
		files[file].content = encrypt(files[file].content, createKey(code));
	}

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
export const PUT: RequestHandler = async ({ cookies, request, params }) => {
	const token = cookies.get('token');
	if (!token) throw error(401, 'Unauthorized');

	const { code } = params;
	const { id, filename, content } = await request.json();

	if (!content || !filename || !id) throw error(400, 'Missing data');

	const octokit = new Octokit({ auth: token });
	const gist = await octokit.gists.update({
		gist_id: id,
		files: {
			[filename]: { content: encrypt(content, createKey(code)) }
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
