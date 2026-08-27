<script>
	import { ChevronLeftIcon } from "@lucide/svelte";
	import ChessBoard from "$lib/components/game/ChessBoard.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import PlaySocket from "playsocketjs";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	let inMatchmaking = $state(false);

	async function startMatchmaking() {
		inMatchmaking = true;
		// Mostly TODO
		// This is simplified, no matchmaking yet, only one room, one player

		try {
			multiplayerState.socket = new PlaySocket(null, {
				endpoint: "ws://localhost:4000", // Ws for local dev here, should be wss for production
			});

			multiplayerState.socket.onEvent("status", (status) => console.info("Multiplayer status:", status));
			multiplayerState.socket.onEvent("storageUpdated", (storage) => {
				multiplayerState.storage = storage;
			});

			await multiplayerState.socket.init();
			await multiplayerState.socket.createRoom();
			await new Promise((res) => setTimeout(res, 500)); // Simulated delay, TODO remove
			inMatchmaking = false; // Now in a game
		} catch (error) {
			console.error("Error starting multiplayer:", error);
			// TODO: User-facing error here via a neat showError(...) function
		}
	}

	// Start matchmkaing on pageload
	onMount(() => {
		startMatchmaking();
	});
</script>

<main class="relative flex min-h-screen w-full p-8 text-slate-900">
	<!-- Overlay for matchmaking waiting animation-->
	{#if inMatchmaking}
		<div class="bg-background absolute inset-0 z-100 flex flex-col items-center justify-center gap-8" out:fade>
			<p>Waiting for match...</p>
			<Button variant="secondary">Cancel</Button>
		</div>
	{/if}
	<Button
		size="lg"
		variant="secondary"
		class="group absolute top-0 left-0 m-4 cursor-pointer gap-1"
		onclick={() => (window.location.href = "/")}
		><ChevronLeftIcon class="-mb-0.5 -ml-0.5 transition-transform group-hover:-translate-x-0.5" /> Leave</Button
	>
	<div class="flex flex-1 items-center justify-center">
		<ChessBoard />
	</div>
</main>
