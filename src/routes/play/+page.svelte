<script lang="ts">
	import { ChevronLeftIcon, Flag } from "@lucide/svelte";
	import ChessBoard from "$lib/components/game/ChessBoard.svelte";
	import { goto } from "$app/navigation";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import EndModal from "./EndModal.svelte";

	const isGameOver = $derived(multiplayerState.storage.status?.isGameOver);

	function quitGame() {
		if (multiplayerState.socket?.id) multiplayerState.socket.destroy();
		goto("/");
	}
</script>

<main class="relative flex min-h-screen w-full p-8 text-slate-900">
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

	<div class="flex flex-1 scale-75 items-center justify-center md:scale-100">
		<ChessBoard />
		<!-- TODO: Add match history view mode after a match ends -->
	</div>
	{#if isGameOver}
		<EndModal />
	{/if}
</main>
