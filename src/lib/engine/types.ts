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

export interface Move {
	from: Position;
	to: Position;
}

export interface GameStatus {
	isCheck: boolean;
	isTimeout: boolean;
	isCheckmate: boolean;
	isStalemate: boolean;
	winner: PieceColor | "draw" | null;
	isGameOver: boolean;
}

export interface Meta {
	isPrivate: boolean;
	roomId?: string;
	whiteId?: string;
	blackId?: string;
}

export interface RoomStorage {
	turn?: PieceColor;
	board?: BoardGrid;
	blackTime?: number;
	whiteTime?: number;
	turnStartedAt?: number | null;
	status?: GameStatus;
	meta?: Meta;
	[key: string]: unknown;
}
