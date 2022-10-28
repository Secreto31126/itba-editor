<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<svelte:head>
	<title>{'ITBA Editor Login'}</title>
</svelte:head>

<main class="flex justify-center items-center w-screen h-screen">
	{#if form?.invalid}<p class="text-red-600">The token is required</p>{/if}
	{#if form?.incorrect}<p class="text-red-600">Invalid token!</p>{/if}
	<form method="POST" use:enhance class="w-full text-center">
		<input
			type="text"
			name="token"
			placeholder="GitHub Token (with gist permissions)"
			value={form?.token ?? ''}
			class="px-5 py-2 rounded-lg border-2 border-gray-200 w-3/5"
		/>
		<button type="submit">Login</button>
	</form>
</main>
