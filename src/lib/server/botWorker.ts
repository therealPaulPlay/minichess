import { createBoardFromMoves } from "../engine/helpers.ts";
import type { PieceColor, RoomStorage } from "../engine/types.ts";
import PlaySocket from "playsocketjs";
import { pickBestMove } from "./bot.ts";

export class BotWorker {
	private socket: PlaySocket;
	private isThinking = false;
	public id: string = "";
	public depth: number;
	public onGameOver?: () => void;

	constructor(depth = 3, elo = 800) {
		this.depth = depth;
		this.socket = new PlaySocket(null, { endpoint: "ws://localhost:3000/socket", customData: { elo } });
		this.socket.onEvent("storageUpdated", (storage: RoomStorage) => {
			if (!storage || storage.meta?.isQueue) return;
			if (storage.status?.isGameOver) {
				this.onGameOver?.();
				return;
			}

			const myId = this.id;
			if (storage.meta?.whiteId !== myId && storage.meta?.blackId !== myId) return;

			const botColor: PieceColor = storage.meta?.whiteId === myId ? "white" : "black";
			const moves = storage.moveHistory || [];

			// Ignore update if moveHistory hasn't arrived yet
			const expectedMovesEven = botColor === "white";
			const actualMovesEven = moves.length % 2 === 0;
			if (expectedMovesEven !== actualMovesEven) return;

			// Play move if it's our turn
			if (storage.status?.turn === botColor && !this.isThinking && storage.meta?.initialBoard) {
				this.isThinking = true;
				const board = createBoardFromMoves(storage.meta.initialBoard, storage.moveHistory || []);
				const move = pickBestMove(board, botColor, this.depth);

				const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
				setTimeout(() => {
					if (move) {
						this.socket.updateStorage("moveHistory", "array-add", move);
					}
					this.isThinking = false;
				}, randomDelay);
			}
		});
	}

	async connect() {
		this.id = await this.socket.init();
	}

	async joinQueue(elo: number) {
		await this.socket.createRoom({ meta: { isQueue: true, elo } });
	}

	destroy() {
		this.socket.destroy();
	}
}
