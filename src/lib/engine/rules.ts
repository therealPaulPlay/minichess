import type { BoardGrid, Position, PieceColor, Piece, SquareContent, Move } from "./types";

const ORTHOGONALS: [number, number][] = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];
const DIAGONALS: [number, number][] = [
	[1, 1],
	[1, -1],
	[-1, 1],
	[-1, -1],
];

export function isWithinBounds(pos: Position): boolean {
	return pos.row >= 0 && pos.row < 5 && pos.col >= 0 && pos.col < 5;
}

function cloneBoard(board: BoardGrid): BoardGrid {
	return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function findKing(board: BoardGrid, color: PieceColor): Position | null {
	for (let r = 0; r < 5; r++) {
		for (let c = 0; c < 5; c++) {
			const cell = board[r][c];
			if (cell && cell.type === "k" && cell.color === color) {
				return { row: r, col: c };
			}
		}
	}
	return null;
}

export function getPseudoLegalMoves(board: BoardGrid, from: Position): Position[] {
	const piece = board[from.row][from.col];
	if (!piece) return [];

	const moves: Position[] = [];

	switch (piece.type) {
		case "p":
			moves.push(...getPawnMoves(board, from, piece.color));
			break;
		case "n":
			moves.push(...getKnightMoves(board, from, piece.color));
			break;
		case "r":
			moves.push(...getRayMoves(board, from, piece.color, ORTHOGONALS));
			break;
		case "b":
			moves.push(...getRayMoves(board, from, piece.color, DIAGONALS));
			break;
		case "q":
			moves.push(...getRayMoves(board, from, piece.color, [...DIAGONALS, ...ORTHOGONALS]));
			break;
		case "k":
			moves.push(...getRayMoves(board, from, piece.color, [...DIAGONALS, ...ORTHOGONALS], 1));
			break;
	}

	return moves;
}

export function getLegalMoves(board: BoardGrid, from: Position): Position[] {
	const piece = board[from.row][from.col];
	if (!piece) return [];

	const pseudoMoves = getPseudoLegalMoves(board, from);

	return pseudoMoves.filter((to) => !wouldCauseCheck(board, { from, to }, piece.color));
}

// CHECK ENGINE LOGIC

export function isSquareAttacked(board: BoardGrid, targetPos: Position, attackerColor: PieceColor): boolean {
	for (let r = 0; r < 5; r++) {
		for (let c = 0; c < 5; c++) {
			const piece = board[r][c];
			if (piece && piece.color === attackerColor) {
				const moves = getPseudoLegalMoves(board, { row: r, col: c });
				if (moves.some((m) => m.row === targetPos.row && m.col === targetPos.col)) {
					return true;
				}
			}
		}
	}
	return false;
}

export function isInCheck(board: BoardGrid, color: PieceColor): boolean {
	const kingPos = findKing(board, color);
	if (!kingPos) return false;

	const enemyColor: PieceColor = color === "w" ? "b" : "w";
	return isSquareAttacked(board, kingPos, enemyColor);
}

// Simulates a move on a cloned board to see if it leaves or places the player's King in check
export function wouldCauseCheck(board: BoardGrid, move: Move, color: PieceColor): boolean {
	const nextBoard = cloneBoard(board);

	const piece = nextBoard[move.from.row][move.from.col];
	nextBoard[move.to.row][move.to.col] = piece;
	nextBoard[move.from.row][move.from.col] = null;

	return isInCheck(nextBoard, color);
}

export function hasAnyLegalMoves(board: BoardGrid, color: PieceColor): boolean {
	for (let r = 0; r < 5; r++) {
		for (let c = 0; c < 5; c++) {
			const piece = board[r][c];
			if (piece && piece.color === color) {
				const moves = getLegalMoves(board, { row: r, col: c });
				if (moves.length > 0) return true;
			}
		}
	}
	return false;
}

export function isCheckmate(board: BoardGrid, color: PieceColor): boolean {
	return isInCheck(board, color) && !hasAnyLegalMoves(board, color);
}

export function isStalemate(board: BoardGrid, color: PieceColor): boolean {
	return !isInCheck(board, color) && !hasAnyLegalMoves(board, color);
}

// Piece movements

function getPawnMoves(board: BoardGrid, pos: Position, color: PieceColor): Position[] {
	const targets: Position[] = [];
	const dir = color === "w" ? -1 : 1;

	const forward: Position = { row: pos.row + dir, col: pos.col };
	if (isWithinBounds(forward) && board[forward.row][forward.col] === null) {
		targets.push(forward);
	}

	const diagonals = [
		{ row: pos.row + dir, col: pos.col - 1 },
		{ row: pos.row + dir, col: pos.col + 1 },
	];

	for (const diag of diagonals) {
		if (isWithinBounds(diag)) {
			const targetPiece = board[diag.row][diag.col];
			if (targetPiece && targetPiece.color !== color) {
				targets.push(diag);
			}
		}
	}

	return targets;
}

function getKnightMoves(board: BoardGrid, pos: Position, color: PieceColor): Position[] {
	const offsets = [
		[-2, -1],
		[-2, 1],
		[-1, -2],
		[-1, 2],
		[1, -2],
		[1, 2],
		[2, -1],
		[2, 1],
	];

	return offsets
		.map(([r, c]) => ({ row: pos.row + r, col: pos.col + c }))
		.filter((target) => {
			if (!isWithinBounds(target)) return false;
			const piece = board[target.row][target.col];
			return !piece || piece.color !== color;
		});
}

function getRayMoves(
	board: BoardGrid,
	pos: Position,
	color: PieceColor,
	directions: [number, number][],
	maxSteps: number = 5,
): Position[] {
	const targets: Position[] = [];

	directions.forEach(([rDir, cDir]) => {
		let step = 0;
		let current: Position = { col: pos.col, row: pos.row };
		while (step < maxSteps) {
			step++;

			const newPos: Position = {
				row: current.row + rDir,
				col: current.col + cDir,
			};

			if (!isWithinBounds(newPos)) break;

			const targetCell = board[newPos.row][newPos.col];

			if (targetCell?.color === color) break;

			targets.push(newPos);

			if (targetCell?.color !== color && targetCell?.color) break;

			current = newPos;
		}
	});
	return targets;
}
