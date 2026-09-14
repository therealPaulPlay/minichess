<script lang="ts">
	import { ChevronLeftIcon, Flag } from "@lucide/svelte";
	import ChessBoard from "$lib/components/game/ChessBoard.svelte";
	import { goto } from "$app/navigation";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import Button, { buttonVariants } from "$lib/components/ui/button/button.svelte";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import EndModal from "./EndModal.svelte";
	import Replay from "./Replay.svelte";
	import { playSound } from "$lib/components/effects/sounds";

	const isGameOver = $derived(multiplayerState.storage.status?.isGameOver);
	const userColor = $derived(
		multiplayerState.storage?.meta?.whiteId === multiplayerState.socket?.id ? "white" : "black",
	);

	let isEndModalOpen = $state(true);
	let endSoundPlayed = $state(false);

	function quitGame() {
		if (!isGameOver) playSound("endLose");
		if (multiplayerState.socket?.id) multiplayerState.socket.destroy();
		goto("/");
	}

	$effect(() => {
		if (isGameOver && !endSoundPlayed) {
			if (multiplayerState.storage.status?.winner === userColor) playSound("endWin");
			else playSound("endLose");
			endSoundPlayed = true;
		}
	});
</script>

<main class="relative flex min-h-screen w-full bg-zinc-100 p-8 text-slate-900">
	{#if isGameOver}
		<!-- Safe exit when game has ended (no forfeit confirmation) -->
		<Button
			variant="secondary"
			size="lg"
			class="group absolute top-0 left-0 z-10 m-4 cursor-pointer gap-1"
			onclick={quitGame}
		>
			<ChevronLeftIcon class="-mb-0.5 -ml-0.5 transition-transform group-hover:-translate-x-0.5" />
			Main Menu
		</Button>
	{:else}
		<!-- Active match: confirm before forfeiting -->
		<AlertDialog.Root>
			<AlertDialog.Trigger
				class={buttonVariants({ variant: "secondary", size: "lg" }) +
					" group absolute top-0 left-0 z-10 m-4 cursor-pointer gap-1"}
			>
				<ChevronLeftIcon class="-mb-0.5 -ml-0.5 transition-transform group-hover:-translate-x-0.5" />
				Leave
			</AlertDialog.Trigger>
			<AlertDialog.Content class="sm:max-w-xs">
				<AlertDialog.Header>
					<AlertDialog.Title>Are you sure?</AlertDialog.Title>
					<AlertDialog.Description
						>Leaving now will <span class="font-bold">forfeit</span> the match to your opponent.</AlertDialog.Description
					>
				</AlertDialog.Header>
				<AlertDialog.Footer class="flex gap-2">
					<AlertDialog.Cancel class="flex-1 py-2 sm:py-0">Stay</AlertDialog.Cancel>
					<AlertDialog.Action class="flex-1 py-2 sm:py-0" onclick={quitGame}
						>Forfeit <Flag stroke-width="3" /></AlertDialog.Action
					>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/if}

	<div class="flex flex-1 scale-75 flex-col items-center justify-center gap-2 md:scale-100">
		{#if isGameOver}
			<Replay
				moves={multiplayerState.storage?.moveHistory || []}
				initialBoard={multiplayerState.storage?.meta?.initialBoard || []}
				isFlipped={userColor === "black"}
				winner={multiplayerState.storage?.status?.winner ?? "draw"}
				cellSize={60}
			/>
			<!-- Reopen End Modal button when reviewing board -->
			<Button
				variant="ghost"
				size="lg"
				class="cursor-pointer font-medium"
				disabled={isEndModalOpen}
				onclick={() => (isEndModalOpen = true)}
			>
				Back to summary
			</Button>
		{:else}
			<ChessBoard />
		{/if}
	</div>

	{#if isGameOver}
		<EndModal bind:open={isEndModalOpen} />
	{/if}
</main>
