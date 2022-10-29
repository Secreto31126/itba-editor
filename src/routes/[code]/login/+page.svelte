<script lang="ts">
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<svelte:head>
	<title>{'ITBA Editor Login'}</title>
</svelte:head>

<main class="flex flex-col justify-center text-center w-screen h-screen">
	{#if form?.invalid}<p class="text-red-600">The token is required</p>{/if}
	{#if form?.incorrect}<p class="text-red-600">Invalid token!</p>{/if}
	{#if form?.scope}<p class="text-red-600">The token doesn't have the required scope: gists</p>{/if}
	{#if form?.internal}<p class="text-red-600">Internal Error, try again</p>{/if}
	<form method="POST" use:enhance class="flex justify-center items-center w-full">
		<div class="w-full">
			<input
				type="text"
				name="token"
				placeholder="GitHub Token (with gist permissions)"
				value={form?.token ?? ''}
				class="px-5 py-2 rounded-lg border-2 border-gray-200 w-3/5"
			/>
			<button
				type="submit"
				on:click|once={(e) => {
					if (!e.target) return;
					// @ts-ignore - Typescript doesn't know about the `disabled` property
					e.target.disabled = true;
					// @ts-ignore - Typescript doesn't know about the `form` property
					e.target.form.submit();
				}}
				class="disabled:bg-green-100 transition-colors"
			>
				Login
			</button>
		</div>
	</form>
</main>
