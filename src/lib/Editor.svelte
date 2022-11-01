<script lang="ts">
	import type monaco from 'monaco-editor';

	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let content: string;
	export let theme: string;
	export let saving: boolean;

	let divEditor: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;

	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: function (_moduleId, label) {
				return new editorWorker();
			}
		};

		Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(divEditor, {
			value: content,
			quickSuggestions: false,
			language: 'c',
			theme
		});

		return () => {
			editor.dispose();
		};
	});

	// When saving is true, forces the editor to refresh the content
	$: if (browser && editor && saving) {
		content = editor.getValue();
	}
</script>

<div bind:this={divEditor} class="min-h-[85vh] h-full w-full" />
