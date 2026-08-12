<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import Square from "$lib/components/game/Square.svelte";
</script>

<main class="flex min-h-screen w-full bg-zinc-100 p-8 text-slate-900">
	<div class="flex flex-col justify-center items-center flex-1">
		<div class="grid grid-cols-2 p-2 bg-dark/5 rounded-[12px] gap-1 scale-75">
			{#each { length: 4 } as _, i}
				<Square isDark={i === 0 || i === 3} />
			{/each}
		</div>
		<h1 class="text-7xl font-sans text-dark hover:cursor-default mb-20">
			<span class="inline-block transition-transform ease-in-out hover:scale-50 origin-right delay-500">Mini</span>chess
		</h1>
		<Button size="lg" class="cursor-pointer bg-dark text-xl" onclick={() => (window.location.href = "/play")}
			>Play</Button
		>
	</div>
</main>
