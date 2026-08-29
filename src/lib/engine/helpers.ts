import type { BoardGrid, Piece, Position } from "./types";

export function pieceAt(board: BoardGrid, pos: Position): Piece | null {
    return board[pos.row][pos.col];
}