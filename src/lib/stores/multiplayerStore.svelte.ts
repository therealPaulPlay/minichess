import type PlaySocket from "playsocketjs";

type MultiplayerState = {
	socket: PlaySocket | null;
	storage: Record<string, unknown>;
};

export const multiplayerState = $state<MultiplayerState>({ socket: null, storage: {} });