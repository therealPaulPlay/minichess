<script>
	import MoveLeft from "@lucide/svelte/icons/move-left";
	import ChessBoard from "$lib/components/game/ChessBoard.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
</script>

<main class="flex relative min-h-screen w-full bg-zinc-100 p-8 text-slate-900">
	<Button
		size="lg"
		variant="ghost"
		class="absolute top-0 left-0 m-3 hover:underline group cursor-pointer"
		onclick={() => (window.location.href = "/")}
		><MoveLeft class="group-hover:-translate-x-1 transition-transform" /> Leave</Button
	>
	<div class="flex justify-center items-center flex-1">
		<ChessBoard />
	</div>
</main>
