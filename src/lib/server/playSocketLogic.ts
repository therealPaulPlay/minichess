import PlaySocketServer from "playsocketjs/server";
import { createServer } from "node:http";
import { getClientIp } from "./clientIp.ts";
import { isWsUpgradeRateLimited } from "./webSocketRateLimit.ts";
import { ChessGame, initialBoard } from "./gameLogic.ts";

import type { IncomingMessage } from "node:http";
import type { Move, RoomStorage } from "../engine/types.ts";

const PORT = 3000;

// In production server.js attaches the SvelteKit handler to this, so both share one port
// On the dev server vite uses the port set up for vite, and the backend server here needs to be spun up separately (see readme)
export const httpServer = createServer();

const server = new PlaySocketServer({
	server: httpServer,
	path: "/socket",
	verifyClient: (
		info: { req: IncomingMessage },
		callback: (_res: boolean, _code?: number, _message?: string) => void,
	) => {
		if (isWsUpgradeRateLimited(getClientIp(info.req))) return callback(false, 429, "Too Many Requests");
		callback(true);
	},
});

const chessGameInstances = new Map<string, ChessGame>(); // Room ID -> chess game instance

server.onEvent("roomCreationRequested", ({ clientId, initialStorage }) => {
	const isWhite = Math.random() > 0.5;

	return {
		...initialStorage,
		meta: {
			...initialStorage?.meta,
			initialBoard,
			whiteId: isWhite ? clientId : undefined,
			blackId: isWhite ? undefined : clientId,
		},
		status: new ChessGame().status,
		moveHistory: [],
	} satisfies RoomStorage;
});

server.onEvent("roomCreated", (roomId: string) => {
	server.updateRoomStorage(roomId, "meta", "object-set-key", "roomId", roomId);
	const chessGame = new ChessGame();

	chessGame.onTimeout = () => {
		server.updateRoomStorage(roomId, "status", "set", chessGame.status);
	};

	chessGameInstances.set(roomId, chessGame);
});

server.onEvent("roomDestroyed", (roomId: string) => {
	chessGameInstances.get(roomId)?.stopClock();
	chessGameInstances.delete(roomId);
});

server.onEvent("storageUpdateRequested", ({ roomId, clientId, update, storage }) => {
	const { key, type, value } = server.getUpdateDetails(update);

	if (key === "moveHistory") {
		if (type !== "array-add") return "Invalid operation";

		const move = value as Move;
		if (!move?.from || !move?.to) return "Invalid move type";

		const chessGame = chessGameInstances.get(roomId);
		if (!chessGame) return "Game not found";

		const playerColor =
			storage?.meta?.whiteId === clientId ? "white" : storage?.meta?.blackId === clientId ? "black" : null;
		if (playerColor !== chessGame.turn) return "Not player's turn";

		const allowed = chessGame.move(move.from, move.to);
		if (allowed !== true) return allowed;

		chessGame.changeTurn();
		server.updateRoomStorage(roomId, "status", "set", chessGame.status);
	}
});

// Start and clean exit -----------------------------------------------------------------
httpServer.listen(PORT, "0.0.0.0", () => console.log(`Listening on port ${PORT}.`));

function shutdown() {
	server.stop();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
