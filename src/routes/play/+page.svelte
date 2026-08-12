<script>
	import { ChevronLeftIcon } from "@lucide/svelte";
	import ChessBoard from "$lib/components/game/ChessBoard.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
</script>

<main class="flex relative min-h-screen w-full  p-8 text-slate-900">
	<Button
		size="lg"
		variant="secondary"
		class="absolute top-0 left-0 m-4 group cursor-pointer gap-1"
		onclick={() => (window.location.href = "/")}
		><ChevronLeftIcon class="group-hover:-translate-x-0.5 transition-transform -mb-0.5 -ml-0.5" /> Leave</Button
	>
	<div class="flex justify-center items-center flex-1">
		<ChessBoard />
	</div>
</main>
