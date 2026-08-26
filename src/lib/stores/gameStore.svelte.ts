import { getLegalMoves, isCheckmate, isInCheck, isStalemate } from "../engine/rules";
import type { BoardGrid, Position, PieceColor, Piece } from "../engine/types";

const INITIAL_TIME_SECONDS = 300;

const initialBoard: BoardGrid = [
	[
		{ type: "r", color: "b" },
		{ type: "n", color: "b" },
		{ type: "b", color: "b" },
		{ type: "q", color: "b" },
		{ type: "k", color: "b" },
	],
	[
		{ type: "p", color: "b" },
		{ type: "p", color: "b" },
		{ type: "p", color: "b" },
		{ type: "p", color: "b" },
		{ type: "p", color: "b" },
	],
	[null, null, null, null, null],
	[
		{ type: "p", color: "w" },
		{ type: "p", color: "w" },
		{ type: "p", color: "w" },
		{ type: "p", color: "w" },
		{ type: "p", color: "w" },
	],
	[
		{ type: "r", color: "w" },
		{ type: "n", color: "w" },
		{ type: "b", color: "w" },
		{ type: "q", color: "w" },
		{ type: "k", color: "w" },
	],
];

function createGame() {
	let board = $state<BoardGrid>(structuredClone(initialBoard));
	let turn = $state<PieceColor>("w");
	let selectedPos = $state<Position | null>(null);
	let validMoves = $state<Position[]>([]);

	// Clock states
	let whiteTime = $state<number>(INITIAL_TIME_SECONDS);
	let blackTime = $state<number>(INITIAL_TIME_SECONDS);
	let isClockRunning = $state<boolean>(false);

	let lastTickTime: number | null = null;
	let timerId: ReturnType<typeof setInterval> | null = null;

	const isCheck = $derived(isInCheck(board, turn));
	const isTimeout = $derived(whiteTime <= 0 || blackTime <= 0);
	const isOver = $derived(isTimeout || isCheckmate(board, turn) || isStalemate(board, turn));
	const winner = $derived.by<PieceColor | "draw" | null>(() => {
		if (whiteTime <= 0) return "b";
		if (blackTime <= 0) return "w";
		if (isCheckmate(board, turn)) return turn === "w" ? "b" : "w";
		if (isStalemate(board, turn)) return "draw";
		return null;
	});

	function tick() {
		if (isOver || !lastTickTime) return;

		const now = performance.now();
		const deltaSeconds = (now - lastTickTime) / 1000;
		lastTickTime = now;

		if (turn === "w") whiteTime = Math.max(0, whiteTime - deltaSeconds);
		else blackTime = Math.max(0, blackTime - deltaSeconds);

		if (whiteTime === 0 || blackTime === 0) stopClock();
	}

	function startClock() {
		if (isOver || timerId !== null) return;

		lastTickTime = performance.now();

		timerId = setInterval(tick, 100); // 100ms
		isClockRunning = true;
	}

	function stopClock() {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
		lastTickTime = null;
		isClockRunning = false;
	}

	function clearSelection() {
		selectedPos = null;
		validMoves = [];
	}

	function move(from: Position, to: Position) {
		if (isOver) return;

		const pieceToMove = board[from.row][from.col];
		if (!pieceToMove) return;

		// Apply pawn promotion
		const isPromotion = pieceToMove.type === "p" && (to.row === 0 || to.row === 4);
		const finalPiece = isPromotion ? { ...pieceToMove, type: "q" as const } : pieceToMove;

		// Update board state
		board[to.row][to.col] = finalPiece;
		board[from.row][from.col] = null;

		// Switch turn and clear active selections
		turn = turn === "w" ? "b" : "w";
		clearSelection();

		// Clock
		if (!isClockRunning) startClock();
		else lastTickTime = performance.now();

		if (isCheckmate(board, turn) || isStalemate(board, turn)) stopClock();
	}

	function pieceAt(pos: Position): Piece | null {
		return board[pos.row][pos.col];
	}

	return {
		get board() {
			return board;
		},
		get turn() {
			return turn;
		},
		get selectedPos() {
			return selectedPos;
		},
		get validMoves() {
			return validMoves;
		},
		get isCheck() {
			return isCheck;
		},
		get isCheckmate() {
			return isCheckmate(board, turn);
		},
		get isStalemate() {
			return isStalemate(board, turn);
		},
		get isGameOver() {
			return isOver;
		},
		get winner() {
			return winner;
		},
		get whiteTime() {
			return whiteTime;
		},
		get blackTime() {
			return blackTime;
		},
		get isClockRunning() {
			return isClockRunning;
		},
		get INITIAL_TIME_SECONDS() {
			return INITIAL_TIME_SECONDS;
		},

		move,

		pieceAt,

		handleSquareClick(pos: Position) {
			const clickedPiece = board[pos.row][pos.col];

			if (clickedPiece && clickedPiece.color === turn) {
				selectedPos = pos;
				validMoves = getLegalMoves(board, pos);
				return;
			}

			if (selectedPos) {
				const isValid = validMoves.some((m) => m.row === pos.row && m.col === pos.col);
				if (isValid) {
					move(selectedPos, pos);
					return;
				}
			}

			clearSelection();
		},

		reset() {
			stopClock();
			whiteTime = INITIAL_TIME_SECONDS;
			blackTime = INITIAL_TIME_SECONDS;
			board = structuredClone(initialBoard);
			turn = "w";
			clearSelection();
		},
	};
}

export const game = createGame();
