<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import Square from "$lib/components/game/Square.svelte";
</script>

<main class="flex min-h-screen w-full bg-zinc-100 p-8 text-slate-900">
	<div class="flex flex-1 flex-col items-center justify-center">
		<div class="bg-dark/5 grid scale-75 grid-cols-2 gap-1 rounded-[12px] p-2">
			{#each { length: 4 } as _, i}
				<Square isDark={i === 0 || i === 3} />
			{/each}
		</div>
		<h1 class="text-dark mb-20 font-sans text-7xl hover:cursor-default">
			<span class="inline-block origin-right transition-transform delay-500 ease-in-out hover:scale-50">Mini</span>chess
		</h1>
		<Button size="lg" class="bg-dark cursor-pointer text-xl" onclick={() => (window.location.href = "/play")}
			>Play</Button
		>
	</div>
</main>
