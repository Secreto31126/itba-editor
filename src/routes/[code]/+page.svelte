<script lang="ts">
	// #region Imports

	import type { PageData } from './$types';
	import Editor from '$lib/Editor.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import motivation from '$lib/motivation';
	import keyevents from '$lib/key_handler';
	import { browser } from '$app/environment';
	import { tick } from 'svelte';

	// #endregion

	export let data: PageData;

	const username: string = data.username ?? '';

	// #region Files, File and Filename

	function getFilename(i = 0): string {
		return Object.keys(data.files ?? { '': true })[i];
	}

	function createFile(): { content: string } {
		const new_file = { content: motivation() };
		data.files = { ...data.files, [filename]: new_file };
		return new_file;
	}

	let filename: string = getFilename();
	let filename_next: string = filename;

	// If file doesn't exist, create it
	$: file = filename ? data.files?.[filename] ?? createFile() : null;

	// #endregion

	// When saving is true, forces the editor to refresh the content
	let saving: boolean = false;
	async function saveProgress(): Promise<void> {
		// Don't save while saving
		if (!file || saving) {
			return;
		}

		saving = true;

		// Wait for the editor to update the content
		await tick();
		console.log(file.content);

		if (file.content) {
			await fetch(`${window.location.href}/api`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: data.id,
					filename,
					content: file.content
				})
			});
		} else {
			await fetch(`${window.location.href}/api`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: data.id,
					filename
				})
			});

			delete data.files?.[filename];

			// If no file change is expected, go to the first file
			if (filename === filename_next) {
				filename_next = getFilename();
			}

			alert(`Se borró el archivo ${filename}`);
		}

		saving = false;
	}

	// #region Auto-save

	// Save file when editor sends changes
	$: if (browser && file?.content) {
		console.log('Auto');
		saveProgress();
	}

	// #endregion

	// #region File change

	$: console.log(filename, filename_next);
	async function changeFile(new_filename: string) {
		console.log('Change');

		// Just to make sure if the file should have been deleted
		await tick();

		// Change is always late for the party
		if (data.files?.[filename]) {
			await saveProgress();
		}

		filename = new_filename;
	}

	// Change file every time filename_next changes
	$: if (browser) {
		changeFile(filename_next);
	}

	// #endregion

	// #region Theme

	let theme: string;
	let theme_next: string = 'vs';
	async function changeTheme(new_theme: string) {
		await saveProgress();
		theme = new_theme;
	}

	// Change theme every time the next theme is set
	$: if (browser) {
		changeTheme(theme_next);
	}

	// Get a list of the files with content
	$: filenames_with_content = Object.keys(data.files ?? {}).filter(
		(filename) => data.files?.[filename].content
	);

	// #endregion

	// #region Key events

	async function handle_keys(e: KeyboardEvent) {
		const handle = keyevents(e);

		if (!handle) {
			return;
		}

		switch (handle) {
			case 'save':
				console.log('Keyboard');
				await saveProgress();
				return;
			case 'next':
				// Thanks Copilot :)
				filename_next =
					filenames_with_content[
						(filenames_with_content.indexOf(filename) + 1) % filenames_with_content.length
					];
				return;
			case 'previous':
				filename_next =
					filenames_with_content[
						(filenames_with_content.indexOf(filename) + filenames_with_content.length - 1) %
							filenames_with_content.length
					];
				return;
		}
	}

	// #endregion
</script>

<svelte:head>
	<title>{filename ?? username ?? 'ITBA Editor'}</title>
</svelte:head>

<svelte:body on:keydown={handle_keys} />

<main class="flex flex-col h-4/5 w-screen space-y-2 pt-2">
	{#if data.status === 200 && data.files}
		<Navbar bind:filename={filename_next} filelist={filenames_with_content} />
		{#if file}
			{#key filename}
				{#key theme}
					<Editor bind:content={file.content} {theme} {saving} />
				{/key}
			{/key}
			<Footer {saving} bind:theme={theme_next} />
		{:else}
			<p class="text-center">Pick or create a file to edit</p>
		{/if}
	{:else if data.status >= 400}
		<p>Huh, weird bug...</p>
		<p>{data.reason}</p>
	{:else}
		<p>No hay archivos para leer, pero tampoco tiró un error el servidor</p>
		<p>Interesting...</p>
	{/if}
</main>
