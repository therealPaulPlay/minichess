import { getLegalMoves } from "../engine/rules";
import type { BoardGrid, Position, PieceColor, Piece } from "../engine/types";

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

	function clearSelection() {
		selectedPos = null;
		validMoves = [];
	}

	function move(from: Position, to: Position) {
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
			board = structuredClone(initialBoard);
			turn = "w";
			clearSelection();
		},
	};
}

export const game = createGame();
