<script type="ts">
	export let theme: string;
	export let saving: boolean;
</script>

<footer class="grid grid-cols-[1fr_min-content]">
	<select bind:value={theme} class="max-w-min mx-4">
		<option value="vs" selected>vs</option>
		<option value="vs-dark">vs-dark</option>
		<option value="hc-black">hc-black</option>
		<option value="hc-light">hc-light</option>
	</select>
	<div class="px-4" class:bg-red-400={saving} class:bg-green-400={!saving}>
		{#if saving}
			<p>Guardando...</p>
		{:else}
			<p>Guardado</p>
		{/if}
	</div>
</footer>
