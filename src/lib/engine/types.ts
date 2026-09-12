export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PieceColor = "white" | "black";

export interface Piece {
	type: PieceType;
	color: PieceColor;
}

export type SquareContent = Piece | null;
export type BoardGrid = SquareContent[][];

export interface Position {
	row: number; // 0 to 4
	col: number; // or should make it a string? Or will the combination of both cause a headache?
}

export interface PieceOnBoard {
	piece: Piece;
	pos: Position;
}

export interface Move {
	from: Position;
	to: Position;
	promotion?: PieceType;
}

export interface GameStatus {
	isCheck: boolean;
	isTimeout: boolean;
	isCheckmate: boolean;
	isStalemate: boolean;
	isResigned: boolean;
	isGameOver: boolean;
	isInsufficientMaterial: boolean;
	winner: PieceColor | "draw" | null;

	turn: PieceColor;
	blackTime: number;
	whiteTime: number;
	turnStartedAt: number | null;
}

export interface Meta {
	isPrivate?: boolean;
	isQueue?: boolean;
	roomId?: string;
	whiteId?: string;
	blackId?: string;
	initialBoard?: BoardGrid;
	elo?: number;
}

export interface RoomStorage {
	status?: GameStatus;
	meta?: Meta;
	moveHistory?: Move[];
	[key: string]: unknown;
}

export interface Player {
	id: string;
	roomId: string;
	elo?: number;
}

export interface QueuedPlayer extends Player {
	joinedAt: number;
}
