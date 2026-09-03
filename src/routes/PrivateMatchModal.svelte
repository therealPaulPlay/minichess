<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Spinner } from "$lib/components/ui/spinner/index.js";

	import { Users } from "@lucide/svelte";
	import { ClipboardPaste } from "@lucide/svelte";
	import { ExternalLink } from "@lucide/svelte";

	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import PlaySocket from "playsocketjs";
	import { goto } from "$app/navigation";
	import type { RoomStorage } from "$lib/engine/types";

	let joinCode = $state("");

	let creatingRoom = $state(false);

	async function createRoom() {
		if (multiplayerState.socket?.id !== null) multiplayerState.socket?.destroy();
		try {
			creatingRoom = true;
			multiplayerState.socket = new PlaySocket(null, {
				endpoint: "ws://localhost:3000/socket",
			});

			multiplayerState.socket.onEvent("status", (status) => console.log(status));
			multiplayerState.socket.onEvent("storageUpdated", (storage: RoomStorage) => {
				multiplayerState.storage = storage;
			});

			await multiplayerState.socket.init();
			const roomId = await multiplayerState.socket.createRoom({ meta: { isPrivate: true } } satisfies RoomStorage);

			multiplayerState.socket.updateStorage("meta", "object-set-key", "roomId", roomId);
			// Assigns the side at lobby creation
			multiplayerState.socket.updateStorage(
				"meta",
				"object-set-key",
				Math.random() > 0.5 ? "whiteId" : "blackId",
				multiplayerState.socket.id,
			);
			await new Promise((res) => setTimeout(res, 1000)); // Simulated delay, TODO remove
			creatingRoom = false;
			goto("/lobby");
		} catch (error) {
			console.log(error);
			creatingRoom = false;
		}
	}

	async function joinRoom() {
		if (joinCode === "" || joinCode.length < 6) return; // TODO: add a couple more checks and error message
		try {
			if (!multiplayerState.socket?.id) {
				multiplayerState.socket = new PlaySocket(null, {
					endpoint: "ws://localhost:3000/socket",
				});
				await multiplayerState.socket.init();
			}
			multiplayerState.socket.onEvent("status", (status) => console.log(status));
			multiplayerState.socket.onEvent("storageUpdated", (storage: RoomStorage) => {
				multiplayerState.storage = storage;
			});

			await multiplayerState.socket.joinRoom(joinCode);

			if (multiplayerState.socket.storage) multiplayerState.storage = multiplayerState.socket.storage as RoomStorage;

			// Takes the side that's not taken by host
			multiplayerState.socket.updateStorage(
				"meta",
				"object-set-key",
				multiplayerState.storage.meta?.blackId ? "whiteId" : "blackId",
				multiplayerState.socket.id,
			);

			goto("/play");
		} catch (e) {
			console.log(e);
		}
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: "outline" })}><Users />Private match</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-center">Private Match</Dialog.Title>
		</Dialog.Header>
		<div class="flex w-full flex-col items-center justify-between">
			<div class="flex w-full flex-col gap-2">
				<!-- <div class="text-lg font-bold">Create</div> -->
				<div class="flex w-full justify-center">
					<Button onclick={createRoom} class="hover:cursor-pointer">
						Create room
						{#if creatingRoom}
							<Spinner />
						{:else}
							<ExternalLink />
						{/if}
					</Button>
				</div>
			</div>
			<div class="relative my-8 flex w-full items-center justify-center">
				<Separator />
				<span class="bg-background text-muted-foreground absolute px-2 text-xs uppercase"> Or </span>
			</div>
			<div class="flex w-full flex-col gap-2">
				<!-- <div class="text-lg font-bold">Join</div> -->
				<div class="relative self-center">
					<InputOTP.Root
						maxlength={6}
						bind:value={joinCode}
						pasteTransformer={(text) => text.trim().toUpperCase()}
						class="mb-4"
					>
						{#snippet children({ cells })}
							<InputOTP.Group>
								{#each cells.slice(0, 3) as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
							<InputOTP.Separator />
							<InputOTP.Group>
								{#each cells.slice(3, 6) as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
					<Button
						variant="ghost"
						class="absolute top-0 -left-12 opacity-70"
						onclick={async () => (joinCode = await navigator.clipboard.readText())}
					>
						<ClipboardPaste />
					</Button>
					<div class="flex w-full justify-center">
						<Button variant="secondary" onclick={joinRoom}>Join room</Button>
					</div>
				</div>
			</div>
		</div>
		<!-- <Dialog.Footer class="sm:justify-start">
			<Dialog.Close class={buttonVariants({ variant: "secondary" })}>Close</Dialog.Close>
		</Dialog.Footer> -->
	</Dialog.Content>
</Dialog.Root>
