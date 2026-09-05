<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import PrivateMatchModal from "./PrivateMatchModal.svelte";
	import { goto } from "$app/navigation";
	import PawnLogo from "$lib/components/chess-pieces/PawnLogo.svelte";
</script>

<main class="flex min-h-screen w-full bg-zinc-100 p-8 text-slate-900">
	<div class="flex flex-1 flex-col items-center justify-center">
		<div class="relative mb-10 w-fit">
			<div
				class="text-dark relative z-20 flex flex-col items-center font-sans text-7xl font-extralight hover:cursor-default md:flex-row"
			>
				<div class="relative -mb-4 md:mb-0">
					Mini
					<!-- Outer stroke layer -->
					<PawnLogo
						class="pointer-events-none absolute bottom-3 -left-3 z-10 h-auto w-8 overflow-visible stroke-zinc-100 stroke-6 text-transparent"
					/>
					<!-- Inner stroke & fill layer -->
					<PawnLogo
						class="stroke-dark absolute bottom-3 -left-3 z-20 h-auto w-8 overflow-visible stroke-2 text-[#d6d6d6]"
					/>
				</div>
				<span class="text-center">chess</span>
			</div>
		</div>
		<div class="flex flex-col items-center justify-center gap-2">
			<Button size="lg" class="bg-dark w-fit cursor-pointer text-xl" onclick={() => goto("/play")}>Play</Button>
			<PrivateMatchModal />
		</div>
	</div>
</main>
