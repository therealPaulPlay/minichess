import "dotenv/config";
import PlaySocketServer from "playsocketjs/server";
import { getClientIp } from "./clientIp.ts";
import { isWsUpgradeRateLimited } from "./webSocketRateLimit.ts";
import { ChessGame } from "./gameLogic.ts";

let server = new PlaySocketServer({
	port: Number(process.env.SERVER_PORT),
	verifyClient: (info, callback) => {
		if (isWsUpgradeRateLimited(getClientIp(info.req))) return callback(false, 429, "Too Many Requests");
		callback(true);
	},
});

const chessGameInstances = new Map(); // Room ID -> chess game instance

server.onEvent("roomCreationRequested", () => {
	// TODO validate room storage looks sound, board + turn are populated etc.
});

server.onEvent("roomCreated", (roomId: string) => {
	const chessGame = new ChessGame();
	chessGameInstances.set(roomId, chessGame);
});

server.onEvent("roomDestroyed", (roomId: string) => {
	chessGameInstances.delete(roomId);
});

server.onEvent("requestReceived", ({ clientId, roomId, name, data }) => {
	if (name === "move-piece") {
		// TODO implement piece movement
		// Then update a "turn" key in PlaySocket to reflect the turn
	}
});

server.onEvent("storageUpdateRequested", () => {
	// TODO only allow expliclty user-updatable keys & handle validation
});

// Helpers --------------------------------------------------------------------
function updateRoomStorageWithGameState(roomId: string) {
	if (!server.getRoomStorage(roomId)) return; // Room doesn't exist

	const chessGame = chessGameInstances.get(roomId);

	server.updateRoomStorage(roomId, "board", "set", chessGame)
}

// Clean exit -----------------------------------------------------------------
function shutdown() {
	server.stop();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
