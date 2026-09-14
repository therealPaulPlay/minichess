import { applyMove, cloneBoard, getAllPieces, pieceAt } from "../engine/helpers.ts";
import { getLegalMoves, isCheckmate, isStalemate } from "../engine/rules.ts";
import type { BoardGrid, Move, PieceColor, PieceType } from "../engine/types.ts";

const PIECE_VALUES: Record<PieceType, number> = {
	p: 100,
	n: 300,
	b: 300, // TODO: See if the bishop/knight is more advantagous and adjust the values accordingly
	r: 500,
	q: 900,
	k: 10000,
};

export function getAllLegalMoves(board: BoardGrid, color: PieceColor): Move[] {
	const moves: Move[] = [];
	const allPieces = getAllPieces(board, color);

	if (allPieces.length === 0) return moves;

	for (const piece of allPieces) {
		const legalMoves = getLegalMoves(board, piece.pos);
		for (const move of legalMoves) moves.push({ from: piece.pos, to: move });
	}
	return moves;
}

export function evaluateBoard(board: BoardGrid): number {
	const whitePieces = getAllPieces(board, "white");
	const blackPieces = getAllPieces(board, "black");

	const whiteScore = whitePieces.reduce((sum, p) => sum + PIECE_VALUES[p.piece.type], 0);
	const blackScore = blackPieces.reduce((sum, p) => sum + PIECE_VALUES[p.piece.type], 0);

	return whiteScore - blackScore;
}

function scoreMovePriority(board: BoardGrid, move: Move, color: PieceColor): number {
	const piece = pieceAt(board, move.from);
	const target = pieceAt(board, move.to);
	let score = 0;
	// Promotions get highest priority
	if (piece && piece.type === "p") {
		if (color === "white" && move.to.row === 0) score += 5000;
		if (color === "black" && move.to.row === 4) score += 5000;
	}

	// Captures get priority
	if (target) score += PIECE_VALUES[target.type] * 2;

	return score;
}

function minimax(board: BoardGrid, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
	const currentTurn: PieceColor = isMaximizing ? "white" : "black";

	if (isCheckmate(board, currentTurn)) return isMaximizing ? -99999 - depth : 99999 + depth;
	if (isStalemate(board, currentTurn)) return 0;

	// Base case (leaf)
	if (depth === 0) return evaluateBoard(board);

	const legalMoves = getAllLegalMoves(board, currentTurn);
	if (legalMoves.length === 0) return 0;

	if (isMaximizing) {
		let maxEval = -Infinity;

		for (const move of legalMoves) {
			const nextBoard = cloneBoard(board);
			applyMove(nextBoard, move);

			const evaluation = minimax(nextBoard, depth - 1, alpha, beta, false);
			maxEval = Math.max(maxEval, evaluation);

			alpha = Math.max(alpha, evaluation);
			if (beta <= alpha) break;
		}

		return maxEval;
	} else {
		let minEval = Infinity;

		for (const move of legalMoves) {
			const nextBoard = cloneBoard(board);
			applyMove(nextBoard, move);

			const evaluation = minimax(nextBoard, depth - 1, alpha, beta, true);
			minEval = Math.min(minEval, evaluation);

			beta = Math.min(beta, evaluation);
			if (beta <= alpha) break;
		}

		return minEval;
	}
}

export function pickBestMove(board: BoardGrid, botColor: PieceColor, depth: number = 3): Move | null {
	const legalMoves = getAllLegalMoves(board, botColor);
	if (legalMoves.length === 0) return null;

	const isWhite = botColor === "white";
	let bestMove: Move = legalMoves[0];
	let bestScore = isWhite ? -Infinity : Infinity;

	// Shuffle moves so the bot doesn't always play the exact same move in identical positions
	const shuffledMoves = legalMoves.sort((a, b) => {
		const scoreA = scoreMovePriority(board, a, botColor) + Math.random() * 5;
		const scoreB = scoreMovePriority(board, b, botColor) + Math.random() * 5;
		return scoreB - scoreA;
	});

	for (const move of shuffledMoves) {
		const nextBoard = cloneBoard(board);
		applyMove(nextBoard, move);

		const score = minimax(nextBoard, depth - 1, -Infinity, Infinity, !isWhite);

		if (isWhite) {
			if (score > bestScore) {
				bestScore = score;
				bestMove = move;
			}
		} else {
			if (score < bestScore) {
				bestScore = score;
				bestMove = move;
			}
		}
	}
	return bestMove;
}
