<script lang="ts">
	import { goto } from "$app/navigation";
	import ChessLoading from "$lib/components/effects/ChessLoading.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import { Copy, CopyCheck } from "@lucide/svelte";

	// TODO: YOU STOPPED HERE. When a player joins, we check what kind of match they are playing (private or not)
	//       and then we take them to the /play game
	let copied = $state(false);
	let timeoutId: ReturnType<typeof setTimeout>;
	let roomCode = $state(multiplayerState.storage.meta?.roomId);

	multiplayerState.socket?.onEvent("clientJoined", () => {
		if (multiplayerState.socket?.isHost) {
			goto("/play");
		}
	});

	function quitLobby() {
		if (multiplayerState.socket?.id) {
			multiplayerState.socket.destroy();
		}
		goto("/");
	}

	async function copyToClipboard() {
		if (!multiplayerState.socket || roomCode === null) return;
		try {
			await navigator.clipboard.writeText(roomCode || "");
			copied = true;

			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	}
</script>

<div class="flex min-h-screen w-full flex-col items-center justify-center">
	<div class="text-dark mb-12 flex flex-col items-center text-center">
		<div class="mb-4 text-4xl font-bold">Waiting...</div>
		<p class="mb-4 max-w-3/4 text-center">
			Waiting for a player to join your lobby. Share the code on your screen. Once a player enters the game will start
			immediatly.
		</p>
		<div class="relative flex flex-row gap-2">
			{#if roomCode}
				{#each roomCode as letter}
					<span class="text-4xl font-bold underline">{letter.toUpperCase()}</span>
				{/each}
			{/if}
			<div class="absolute -right-12 translate-y-1">
				<Button variant="ghost" onclick={copyToClipboard}>
					{#if !copied}
						<Copy />
					{:else}
						<CopyCheck class="text-green-800" />
					{/if}
				</Button>
			</div>
		</div>
	</div>
	<div class="scale-130">
		<ChessLoading />
	</div>
	<Button onclick={quitLobby}>Leave</Button>
</div>
