import type { BoardGrid, Move, Piece, PieceType, Position } from "./types";

export function pieceAt(board: BoardGrid, pos: Position): Piece | null {
	return board[pos.row][pos.col];
}

export function parseMoveString(moveStr: string): Move {
	return {
		from: { row: Number(moveStr[0]), col: Number(moveStr[1]) },
		to: { row: Number(moveStr[2]), col: Number(moveStr[3]) },
		promotion: (moveStr[4] as PieceType) || undefined,
	};
}

export function formatMoveString(from: Position, to: Position, promotion?: PieceType): string {
	return `${from.row}${from.col}${to.row}${to.col}${promotion ?? ""}`;
}

export function applyMove(board: BoardGrid, move: Move): void {
	const piece = board[move.from.row][move.from.col];
	if (!piece) return;

	const isPromotion = move.promotion || (piece.type === "p" && (move.to.row === 0 || move.to.row === 4));
	const finalPiece = isPromotion ? { ...piece, type: move.promotion || ("q" as PieceType) } : piece;
	board[move.to.row][move.to.col] = finalPiece;
	board[move.from.row][move.from.col] = null;
}

export function createBoardFromMoves(startingBoard: BoardGrid, moves: string[] = []): BoardGrid {
	const board = structuredClone(startingBoard);
	for (const moveStr of moves) {
		applyMove(board, parseMoveString(moveStr));
	}
	return board;
}
