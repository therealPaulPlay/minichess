import PlaySocketServer from "playsocketjs/server";
import { createServer } from "node:http";
import { getClientIp } from "./clientIp.ts";
import { isWsUpgradeRateLimited } from "./webSocketRateLimit.ts";
import { ChessGame, initialBoard } from "./gameLogic.ts";

import type { IncomingMessage } from "node:http";

const PORT = 3000;

// In production server.js attaches the SvelteKit handler to this, so both share one port
// On the dev server vite uses the port set up for vite, and the backend server here needs to be spun up separately (see readme)
export const httpServer = createServer();

const server = new PlaySocketServer({
	server: httpServer,
	path: "/socket",
	verifyClient: (info: { req: IncomingMessage }, callback: (_res: boolean, _code?: number, _message?: string) => void) => {
		if (isWsUpgradeRateLimited(getClientIp(info.req))) return callback(false, 429, "Too Many Requests");
		callback(true);
	},
});

const chessGameInstances = new Map<string, ChessGame>(); // Room ID -> chess game instance

server.onEvent("roomCreationRequested", () => {
	// Client-passed storage is ignored, we override with the same starter room storage
	return {
		turn: "white",
		board: initialBoard,
		blackTime: 0,
		whiteTime: 0,
		status: new ChessGame().status,
	};
});

server.onEvent("roomCreated", (roomId: string) => {
	const chessGame = new ChessGame();
	chessGameInstances.set(roomId, chessGame);
});

server.onEvent("roomDestroyed", (roomId: string) => {
	chessGameInstances.delete(roomId);
});

interface MovePieceData {
	currentPos: { row: number; col: number };
	newPos: { row: number; col: number };
}

server.onEvent("requestReceived", ({ roomId, name, data }: { clientId: string; roomId: string | null; name: string; data: unknown }) => {
	if (name === "move-piece") {
		const moveData = data as MovePieceData | undefined;
		if (!roomId || !moveData?.currentPos || !moveData?.newPos) return;
		const roomStorage = server.getRoomStorage(roomId);
		const chessGame = chessGameInstances.get(roomId);
		if (!roomStorage || !chessGame) return false;
		// TODO: Validate piece color at currentPos matches that client's assigned color, otherwise reject
		const allowed = chessGame.move(moveData.currentPos, moveData.newPos);

		// If the move was allowed, toggle who's turn it is
		if (allowed === true) {
			const turn = chessGame.changeTurn();
			server.updateRoomStorage(roomId, "turn", "set", turn);
			server.updateRoomStorage(roomId, "board", "set", chessGame.board);
			server.updateRoomStorage(roomId, "status", "set", chessGame.status);
		}
		return allowed; // False if not allowed -> blocks the update and reverts
	}
});

server.onEvent("storageUpdateRequested", () => {
	// TODO only allow expliclty user-updatable keys & handle validation
});

// Start and clean exit -----------------------------------------------------------------
httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}.`));

function shutdown() {
	server.stop();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
