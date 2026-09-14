import type { Player, QueuedPlayer } from "$lib/engine/types";
import type PlaySocketServer from "playsocketjs/server";
import { ChessGame, initialBoard } from "./gameLogic.ts";

const matchmakingQueue: QueuedPlayer[] = [];

function findPair(): [QueuedPlayer, QueuedPlayer] | null {
	// Only consider players whose queue room has finished creating
	const readyPlayers = matchmakingQueue.filter((p) => Boolean(p.roomId));
	if (readyPlayers.length < 2) return null;
	readyPlayers.sort((a, b) => a.joinedAt - b.joinedAt);

	const p1 = readyPlayers[0];
	const p1Tolerance = getTolerance(p1.joinedAt);

	for (let i = 1; i < readyPlayers.length; i++) {
		const p2 = readyPlayers[i];
		const p2Tolerance = getTolerance(p2.joinedAt);
		const eloDifference = Math.abs((p1.elo ?? 1000) - (p2.elo ?? 1000));

		if (eloDifference <= p1Tolerance && eloDifference <= p2Tolerance) {
			removeFromQueue(p1.id);
			removeFromQueue(p2.id);
			return [p1, p2];
		}
	}
	return null;
}

export function getTolerance(queuedAt: number): number {
	const waitSeconds = (Date.now() - queuedAt) / 1000;
	// Starts at 50, expands by 10 points every second, capped at 400
	return Math.min(50 + Math.floor(waitSeconds * 10), 400);
}

export function addToQueue(player: Player) {
	if (matchmakingQueue.some((p) => p.id === player.id)) return; // Prevent double-queue
	const joinedAt = Date.now();
	matchmakingQueue.push({ ...player, joinedAt });
}

export function removeFromQueue(clientId: string) {
	const targetIndex = matchmakingQueue.findIndex((p) => p.id === clientId);
	if (targetIndex !== -1) matchmakingQueue.splice(targetIndex, 1);
}

export function startMatchmaking(server: PlaySocketServer) {
	setInterval(() => {
		const pair = findPair();
		if (!pair) return; // No match on this tick, try again next tick!
		const [p1, p2] = pair;
		const isP1White = Math.random() > 0.5;

		const { id: matchRoomId } = server.createRoom(
			{
				meta: {
					whiteId: isP1White ? p1.id : p2.id,
					blackId: isP1White ? p2.id : p1.id,
					whiteElo: isP1White ? p1.elo : p2.elo,
					blackElo: isP1White ? p2.elo : p1.elo,
					initialBoard,
				},
				status: new ChessGame().status,
				moveHistory: [],
			},
			2,
		);

		server.move(p1.id, matchRoomId);
		server.move(p2.id, matchRoomId);
	}, 1500);
}

export function removeRoomFromQueue(roomId: string) {
	const targetIndex = matchmakingQueue.findIndex((p) => p.roomId === roomId);
	if (targetIndex !== -1) matchmakingQueue.splice(targetIndex, 1);
}

export function getPlayerFromId(playerId: string): Player | null {
	return matchmakingQueue.find((p) => p.id === playerId) ?? null;
}
