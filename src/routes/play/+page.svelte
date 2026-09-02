<script lang="ts">
	import { ChevronLeftIcon } from "@lucide/svelte";
	import ChessBoard from "$lib/components/game/ChessBoard.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { goto } from "$app/navigation";
	import { fade } from "svelte/transition";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";

	let inMatchmaking = $state(false);

	// TODO: implement matchmaking

	function quitGame() {
		if (multiplayerState.socket?.id) multiplayerState.socket.destroy();
		goto("/");
	}
</script>

<main class="relative flex min-h-screen w-full p-8 text-slate-900">
	<!-- Overlay for matchmaking waiting animation-->
	{#if inMatchmaking}
		<div class="bg-background absolute inset-0 z-100 flex flex-col items-center justify-center gap-8" out:fade>
			<p>Waiting for match...</p>
			<Button variant="secondary">Cancel</Button>
		</div>
	{/if}
	<Button size="lg" variant="secondary" class="group absolute top-0 left-0 m-4 cursor-pointer gap-1" onclick={quitGame}
		><ChevronLeftIcon class="-mb-0.5 -ml-0.5 transition-transform group-hover:-translate-x-0.5" /> Leave</Button
	>
	<div class="flex flex-1 items-center justify-center">
		<ChessBoard />
	</div>
</main>
