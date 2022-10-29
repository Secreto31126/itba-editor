import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import type { RequestHandler } from './$types';

import { Octokit } from '@octokit/rest';
import { compare, hash } from 'bcryptjs';
import { error, json } from '@sveltejs/kit';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function createKey(code: string): string {
	return createHash('sha256').update(code).digest('hex').slice(0, 32);
}

function encrypt(text: string, key: string): string {
	const iv = randomBytes(16);

	const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	return JSON.stringify({
		iv: iv.toString('base64'),
		content: encrypted.toString('base64')
	});
}

function decrypt(body: string, key: string): string {
	const data = JSON.parse(body);

	data.iv = Buffer.from(data.iv, 'base64');
	data.content = Buffer.from(data.content, 'base64');

	const decipher = createDecipheriv('aes-256-cbc', key, data.iv);
	const desencrypted = decipher.update(data.content, 'base64', 'utf8') + decipher.final('utf8');

	return desencrypted;
}

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
		ptr.content = decrypt(ptr.content, createKey(code));
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
