<script>
	import { page } from "$app/state";
</script>

<svelte:head>
	<title>Error</title>
</svelte:head>

<div class="min-h-svh content-center space-y-4 text-center">
	<p class="md:text-3xl text-2xl">{page.status} ({page.error?.message || "Unknown"})</p>
	<p>Checkmate.</p>
</div>
