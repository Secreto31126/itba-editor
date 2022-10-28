import type { Actions, PageServerLoad } from './$types';
import { invalid, redirect } from '@sveltejs/kit';
import { Octokit } from '@octokit/rest';

export const load: PageServerLoad = async ({ cookies, params }) => {
	// Don't allow the user to access the login page if they are already logged in
	// The key must expire before being able to log in with a different account
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
		let github;
		try {
			github = await octokit.rest.users.getAuthenticated();
		} catch (error) {
			return invalid(401, { token, incorrect: true });
		}

		if (!github.data) {
			return invalid(401, { token, incorrect: true });
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
