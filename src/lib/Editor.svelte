<script lang="ts">
	import type monaco from 'monaco-editor';

	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

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
				switch (label) {
					case 'json':
						return new jsonWorker();
					case 'css':
					case 'scss':
					case 'less':
						return new cssWorker();
					case 'html':
					case 'handlebars':
					case 'razor':
						return new htmlWorker();
					case 'typescript':
					case 'javascript':
						return new tsWorker();
					default:
						return new editorWorker();
				}
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
