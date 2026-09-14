import type { BoardGrid, Move, Piece, PieceColor, PieceOnBoard, PieceType, Position } from "./types";

export function pieceAt(board: BoardGrid, pos: Position): Piece | null {
	return board[pos.row][pos.col];
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

export function cloneBoard(board: BoardGrid): BoardGrid {
	if (!board) return [];
	return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function createBoardFromMoves(startingBoard: BoardGrid, moves: Move[] = []): BoardGrid {
	if (!startingBoard) return [];
	const board = cloneBoard(startingBoard);
	for (const move of moves) applyMove(board, move);

	return board;
}

export function getAllPieces(board: BoardGrid, color: PieceColor): PieceOnBoard[] {
	const pieces: PieceOnBoard[] = [];
	for (let r = 0; r < 5; r++) {
		for (let c = 0; c < 5; c++) {
			const piece = board[r][c];
			if (piece && piece.color === color) pieces.push({ piece, pos: { row: r, col: c } });
		}
	}
	return pieces;
}
