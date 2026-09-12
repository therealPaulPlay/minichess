<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Trophy, RotateCcw, House, Skull, Swords } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import { enterMatchmaking, multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import type { PieceColor, RoomStorage } from "$lib/engine/types";
	import Replay from "./Replay.svelte";
	import Spinner from "$lib/components/ui/spinner/spinner.svelte";

	let gameStorage = $state<RoomStorage | null>(null);
	let isOpen = $state(true);
	let enteringLobby = $state(false);

	async function handlePlayAgain() {
		enteringLobby = true;
		try {
			await enterMatchmaking();
		} finally {
			isOpen = false;
			enteringLobby = false;
		}
	}

	function handleLeave() {
		isOpen = false;
		if (multiplayerState.socket?.id) multiplayerState.socket.destroy();
		goto("/");
	}

	function userColor(): PieceColor | void {
		if (!gameStorage) return;
		return gameStorage.meta?.whiteId === multiplayerState.socket?.id ? "white" : "black";
	}

	function formatMsToMinutesSeconds(ms: number): string {
		const totalSeconds = Math.max(0, Math.floor(ms / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}

	$effect(() => {
		if (multiplayerState.storage?.status) gameStorage = $state.snapshot(multiplayerState.storage);
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class=" w-[92vw] max-w-sm gap-3 p-4 sm:max-w-md sm:gap-4 sm:p-6">
		{#if gameStorage}
			<!-- Result Header Banner / Icon -->
			<div class="flex flex-col items-center justify-center pt-2">
				{#if gameStorage.status?.winner === "draw"}
					<Swords class="text-muted-foreground h-10 w-10" />
					<h2 class="text-muted-foreground text-3xl font-black tracking-tight">Draw</h2>
				{:else if gameStorage.status?.winner === userColor()}
					<Trophy class="h-10 w-10" />
					<h2 class="text-3xl font-black tracking-tight">You won!</h2>
				{:else}
					<Skull class="h-10 w-10" />
					<h2 class="text-3xl font-black tracking-tight">You lost.</h2>
				{/if}

				<p class="text-muted-foreground mt-1 text-sm font-medium">
					{#if gameStorage.status?.winner === "draw"}
						Draw by
						<span class="text-foreground font-semibold">
							{gameStorage.status?.isInsufficientMaterial ? "insufficient material" : "stalemate"}
						</span>
					{:else}
						{gameStorage.status?.winner === userColor() ? "Won" : "Lost"} by
						<span class="text-foreground font-semibold">
							{#if gameStorage.status?.isResigned}
								resignation / abandonment
							{:else}
								{gameStorage.status?.isCheckmate ? "checkmate" : "time"}
							{/if}
						</span>
					{/if}
				</p>
			</div>

			<!-- Match statistics card -->
			<div class="border-border/50 bg-muted/40 grid grid-cols-2 gap-3 rounded-xl border p-4 text-center">
				<div class="flex flex-col items-center">
					<span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Total Moves</span>
					<span class="text-foreground mt-0.5 text-xl font-bold">{gameStorage.moveHistory?.length ?? 0}</span>
				</div>
				<div class="border-border/50 flex flex-col items-center border-l">
					<span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">Duration</span>
					<span class="text-foreground mt-0.5 text-xl font-bold"
						>{formatMsToMinutesSeconds(
							Math.max(0, 600_000 - ((gameStorage.status?.blackTime || 0) + (gameStorage.status?.whiteTime || 0))),
						)}</span
					>
				</div>
			</div>

			<div>
				<Replay moves={gameStorage.moveHistory} initialBoard={gameStorage.meta?.initialBoard} cellSize={30} />
			</div>

			<!-- Actions -->
			<div class="mt-2 flex gap-2">
				<Button variant="outline" class="flex-1 cursor-pointer gap-2" onclick={handleLeave}>
					<House class="h-4 w-4" />
					Main Menu
				</Button>
				<Button
					variant="default"
					class="flex-1 cursor-pointer gap-2 font-semibold"
					disabled={enteringLobby}
					onclick={handlePlayAgain}
				>
					{#if !enteringLobby}
						<RotateCcw />
					{:else}
						<Spinner />
					{/if}
					Play Again
				</Button>
			</div>
		{:else}
			<div>Error loading game data</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
