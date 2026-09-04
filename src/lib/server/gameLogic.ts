import { pieceAt } from "../engine/helpers.ts";
import { getLegalMoves, isCheckmate, isInCheck, isStalemate } from "../engine/rules.ts";
import type { BoardGrid, Position, PieceColor, GameStatus } from "../engine/types.ts";

const INITIAL_TIME_MS = 300_000;

export const initialBoard: BoardGrid = [
	[
		{ type: "r", color: "black" },
		{ type: "n", color: "black" },
		{ type: "b", color: "black" },
		{ type: "q", color: "black" },
		{ type: "k", color: "black" },
	],
	[
		{ type: "p", color: "black" },
		{ type: "p", color: "black" },
		{ type: "p", color: "black" },
		{ type: "p", color: "black" },
		{ type: "p", color: "black" },
	],
	[null, null, null, null, null],
	[
		{ type: "p", color: "white" },
		{ type: "p", color: "white" },
		{ type: "p", color: "white" },
		{ type: "p", color: "white" },
		{ type: "p", color: "white" },
	],
	[
		{ type: "r", color: "white" },
		{ type: "n", color: "white" },
		{ type: "b", color: "white" },
		{ type: "q", color: "white" },
		{ type: "k", color: "white" },
	],
];

export class ChessGame {
	board: BoardGrid = structuredClone(initialBoard);
	turn: PieceColor = "white";

	// Clock ----------------------------------------------
	whiteTime = INITIAL_TIME_MS;
	blackTime = INITIAL_TIME_MS;
	turnStartedAt: number | null = null;
	private timeoutTimer: NodeJS.Timeout | null = null;

	// A callback so we can alert the socket server when time runs out
	onTimeout?: () => void;

	private armTimeout() {
		if (this.timeoutTimer) {
			clearTimeout(this.timeoutTimer);
			this.timeoutTimer = null;
		}

		const remaining = this.turn === "white" ? this.whiteTime : this.blackTime;

		if (remaining <= 0) {
			this.onTimeout?.();
			return;
		}

		this.timeoutTimer = setTimeout(() => {
			if (this.turn === "white") this.whiteTime = 0;
			else this.blackTime = 0;

			this.turnStartedAt = null;
			this.onTimeout?.();
		}, remaining);
	}

	stopClock() {
		if (this.timeoutTimer) {
			clearTimeout(this.timeoutTimer);
			this.timeoutTimer = null;
		}
		this.turnStartedAt = null;
	}

	// Pieces ---------------------------------------------
	move(from: Position, to: Position) {
		if (this.status.isGameOver) return "Game is over";

		const pieceToMove = pieceAt(this.board, { row: from.row, col: from.col });
		if (!pieceToMove) return "Piece not found";

		// Validate
		const validMoves = getLegalMoves(this.board, from);
		const isValid = validMoves.some((m) => m.row === to.row && m.col === to.col);
		if (!isValid) return "Illegal move";

		// Clock
		if (this.turnStartedAt !== null) {
			const elapsed = Date.now() - this.turnStartedAt;
			if (this.turn === "white") this.whiteTime = Math.max(0, this.whiteTime - elapsed);
			else this.blackTime = Math.max(0, this.blackTime - elapsed);
		}

		if (this.whiteTime <= 0 || this.blackTime <= 0) {
			this.stopClock();
			return "Time expired";
		}

		// Apply pawn promotion
		const isPromotion = pieceToMove.type === "p" && (to.row === 0 || to.row === 4);
		const finalPiece = isPromotion ? { ...pieceToMove, type: "q" as const } : pieceToMove;

		// Update board state
		this.board[to.row][to.col] = finalPiece;
		this.board[from.row][from.col] = null;

		if (this.status.isCheckmate || this.status.isStalemate) this.stopClock();
		return true; // Valid move, executed
	}

	changeTurn() {
		this.turn = this.turn === "white" ? "black" : "white";

		this.turnStartedAt = Date.now();

		// Arm the alarm for the player whose turn it now is
		if (!this.status.isGameOver) {
			this.armTimeout();
		} else {
			this.stopClock();
		}

		return this.turn;
	}

	// Status ---------------------------------------------
	private determineWinner(): PieceColor | "draw" | null {
		if (this.whiteTime <= 0) return "black";
		if (this.blackTime <= 0) return "white";
		if (isCheckmate(this.board, this.turn)) return this.turn === "white" ? "black" : "white";
		if (isStalemate(this.board, this.turn)) return "draw";
		return null;
	}

	get status(): GameStatus {
		const status: GameStatus = {
			isCheck: isInCheck(this.board, this.turn),
			isTimeout: this.whiteTime <= 0 || this.blackTime <= 0,
			isCheckmate: isCheckmate(this.board, this.turn),
			isStalemate: isStalemate(this.board, this.turn),
			winner: this.determineWinner(),
			isGameOver: false,
			whiteTime: this.whiteTime,
			blackTime: this.blackTime,
			turn: this.turn,
			turnStartedAt: this.turnStartedAt,
			board: this.board,
		};
		status.isGameOver = status.isTimeout || status.isCheckmate || status.isStalemate;
		return status;
	}
}
