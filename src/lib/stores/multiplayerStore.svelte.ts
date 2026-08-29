import type PlaySocket from "playsocketjs";
import type { RoomStorage } from "$lib/engine/types";

type MultiplayerState = {
	socket: PlaySocket | null;
	storage: RoomStorage;
};

export const multiplayerState = $state<MultiplayerState>({ socket: null, storage: {} });