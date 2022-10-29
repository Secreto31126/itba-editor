import type { Actions, PageServerLoad } from './$types';
import { invalid, redirect } from '@sveltejs/kit';
import { Octokit } from '@octokit/rest';

export const load: PageServerLoad = async ({ cookies, params }) => {
	// Don't allow the user to access the login page if they are already logged in
	// The key must expire before being able to log in with a different account
	if (import.meta.env.DEV) cookies.delete('token');
	const token: string = cookies.get('token') ?? '';
	if (token) throw redirect(302, `/${params.code}`);
	return {};
};

export const actions: Actions = {
	default: async ({ cookies, request, params }) => {
		const data = await request.formData();
		const token = data.get('token');

		if (typeof token !== 'string' || !token) {
			return invalid(400, { invalid: true });
		}

		const octokit = new Octokit({ auth: token });

		let permissions;
		try {
			permissions = await octokit.gists.list();
		} catch (error) {
			return invalid(401, { token, scope: true });
		}

		if (permissions.status >= 400) {
			return invalid(401, { token, scope: true });
		}

		let user;
		try {
			user = await octokit.users.getAuthenticated();
		} catch (error) {
			return invalid(500, { token, internal: true });
		}

		if (user.status >= 400 || !user.data) {
			return invalid(401, { token, broken: true });
		}

		cookies.set('token', token, {
			// send cookie for every page
			path: '/',
			// server side only cookie so you can't use `document.cookie`
			httpOnly: true,
			// only requests from same site can send cookies
			// https://developer.mozilla.org/en-US/docs/Glossary/CSRF
			sameSite: 'strict',
			// only sent over HTTPS in production
			secure: import.meta.env.PROD,
			// set cookie to expire after 4 hours
			maxAge: 60 * 60 * 4
		});

		// redirect the user
		throw redirect(302, `/${params.code}`);
	}
};
