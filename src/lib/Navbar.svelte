<script lang="ts">
	import Button from '$lib/Nice_Button.svelte';

	export let filename: string;
	export let filelist: string[];

	let input_filename: string;
	$: can_create =
		filelist.length < 8 && // Less than 8 files
		!!input_filename && // Input is not empty
		/^[\w\.]+$/i.test(input_filename) && // Input is alphanumeric or dots
		input_filename.length < 16; // Input is less than 16 characters

	function create(): void {
		if (!can_create) {
			return;
		}

		filename = input_filename;
		input_filename = '';
	}
</script>

<nav class="grid grid-cols-[1fr_min-content] px-5">
	<!-- Left fr -->
	<div class="flex space-x-5">
		{#each filelist as name}
			<Button onclick={() => (filename = name)} disabled={name === filename}>
				{name}
			</Button>
		{/each}
	</div>
	<!-- Right min-content -->
	<div class="flex max-w-min">
		<input
			type="text"
			placeholder="Nombre de archivo"
			bind:value={input_filename}
			class="text-center focus:outline-none"
		/>
		<button
			on:click={create}
			class="py-1 mx-2 {!can_create ? 'bg-red-100 hover:border-inherit' : 'bg-green-100'}"
			disabled={!can_create}
		>
			Crear
		</button>
	</div>
</nav>
