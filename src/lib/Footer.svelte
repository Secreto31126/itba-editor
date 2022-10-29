<script type="ts">
	export let theme: string;
	export let saving_status: number;
</script>

<footer class="grid grid-cols-[1fr_min-content]">
	<!-- <select bind:value={theme} class="max-w-min mx-4">
		<option value="vs" selected>vs</option>
		<option value="vs-dark">vs-dark</option>
		<option value="hc-black">hc-black</option>
		<option value="hc-light">hc-light</option>
	</select> -->

	<label for="theme" class="sr-only">Underline select</label>
	<select
		id="theme"
		bind:value={theme}
		class="block mx-4 px-0 max-w-min text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
	>
		<option value="vs" selected>vs</option>
		<option value="vs-dark">vs-dark</option>
		<option value="hc-black">hc-black</option>
		<option value="hc-light">hc-light</option>
	</select>

	<div
		class:!bg-green-400={saving_status > 0}
		class:!bg-red-400={saving_status < 0}
		class="px-4 transition-colors duration-300 bg-orange-400"
	>
		{#if saving_status > 0}
			<p>Guardado</p>
		{:else if saving_status < 0}
			<p>Error</p>
		{:else}
			<p>Guardando...</p>
		{/if}
	</div>
</footer>
