<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { RotateCcw, House, Eye } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import { enterMatchmaking, multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import type { PieceColor, RoomStorage } from "$lib/engine/types";
	import Spinner from "$lib/components/ui/spinner/spinner.svelte";

	let { open = $bindable(true) }: { open?: boolean } = $props();

	let gameStorage = $state<RoomStorage | null>(null);
	let enteringLobby = $state(false);

	async function handlePlayAgain() {
		enteringLobby = true;
		try {
			await enterMatchmaking();
		} finally {
			open = false;
			enteringLobby = false;
		}
	}

	function handleLeave() {
		open = false;
		if (multiplayerState.socket?.id) multiplayerState.socket.destroy();
		goto("/");
	}

	function userColor(): PieceColor | void {
		if (!gameStorage) return;
		return gameStorage.meta?.whiteId === multiplayerState.socket?.id ? "white" : "black";
	}

	$effect(() => {
		if (multiplayerState.storage?.status) gameStorage = $state.snapshot(multiplayerState.storage);
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class=" w-[92vw] max-w-sm gap-3 p-4 sm:max-w-md sm:gap-4 sm:p-6">
		{#if gameStorage}
			<!-- Result Header Banner / Icon -->
			<div class="flex flex-col items-center justify-center pt-4">
				{#if gameStorage.status?.winner === "draw"}
					<h2 class="text-muted-foreground text-4xl font-black tracking-tight">Draw</h2>
				{:else if gameStorage.status?.winner === userColor()}
					<h2 class="text-4xl font-black tracking-tight">You won!</h2>
				{:else}
					<h2 class="text-4xl font-black tracking-tight">You lost.</h2>
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
					<span class="text-muted-foreground mt-1 text-sm font-medium"
						>in {gameStorage.moveHistory?.length ?? 0} moves</span
					>
				</p>
			</div>

			<div class="flex items-center justify-center py-2">
				<Button variant="outline" class="cursor-pointer gap-2" onclick={() => (open = false)}>
					<Eye class="h-4 w-4" />
					Review Board
				</Button>
			</div>

			<!-- Actions -->
			<div class="mt-2 flex gap-2">
				<Button variant="secondary" class="flex-1 cursor-pointer gap-2" onclick={handleLeave}>
					<House class="h-4 w-4" />
					Main menu
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
					Play again
				</Button>
			</div>
		{:else}
			<div>Error loading game data</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
