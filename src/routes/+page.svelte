<script>
	import Button from "$lib/components/ui/button/button.svelte";
</script>

<main class="flex min-h-screen w-full bg-zinc-100 p-8 text-slate-900">
	<div class="flex flex-col justify-center items-center flex-1 gap-20">
		<h1 class="text-7xl font-sans text-dark hover:cursor-default">
			<span class="inline-block transition-transform ease-in-out hover:scale-50 origin-right delay-500">Mini</span
			>Chess
		</h1>
		<Button size="lg" variant="ghost" class="cursor-pointer hover:bg-dark/10" onclick={() => (window.location.href = "/play")}>Play</Button>
	</div>
</main>
