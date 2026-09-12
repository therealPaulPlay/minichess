import PlaySocket from "playsocketjs";
import type { RoomStorage } from "$lib/engine/types";
import { goto } from "$app/navigation";

type MultiplayerState = {
	socket: PlaySocket | null;
	storage: RoomStorage;
};

export const multiplayerState = $state<MultiplayerState>({ socket: null, storage: {} });

export async function enterMatchmaking(elo: number = 1500) {
	multiplayerState.socket?.destroy();
	multiplayerState.socket = new PlaySocket(null, {
		endpoint: `ws://${window.location.host}/socket`,
	});
	multiplayerState.socket.onEvent("storageUpdated", (storage: RoomStorage) => {
		multiplayerState.storage = storage;
	});
	await multiplayerState.socket.init();
	await multiplayerState.socket.createRoom({
		meta: { isQueue: true, elo },
	});
	goto("/lobby");
}
