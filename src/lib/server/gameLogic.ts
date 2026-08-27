import { pieceAt } from "../engine/helpers.ts";
import { getLegalMoves, isCheckmate, isInCheck, isStalemate } from "../engine/rules.ts";
import type { BoardGrid, Position, PieceColor, Piece } from "../engine/types.ts";

const INITIAL_TIME_SECONDS = 300;

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
    // TODO this needs rewriting for multiplayer
    // Syncing every tick would be super heavy on the network / not feasible, instead broadcast a timestamp
    whiteTime = INITIAL_TIME_SECONDS;
    blackTime = INITIAL_TIME_SECONDS;
    isClockRunning = false;

    #lastTickTime: number | null = null;
    #timerId: ReturnType<typeof setInterval> | null = null;

    #tick() {
        if (this.isGameOver || !this.#lastTickTime) return;

        const now = performance.now();
        const deltaSeconds = (now - this.#lastTickTime) / 1000;
        this.#lastTickTime = now;

        if (this.turn === "white") this.whiteTime = Math.max(0, this.whiteTime - deltaSeconds);
        else this.blackTime = Math.max(0, this.blackTime - deltaSeconds);

        if (this.whiteTime === 0 || this.blackTime === 0) this.#stopClock();
    }

    #startClock() {
        if (this.isGameOver || this.#timerId !== null) return;

        this.#lastTickTime = performance.now();

        this.#timerId = setInterval(() => this.#tick(), 100); // 100ms
        this.isClockRunning = true;
    }

    #stopClock() {
        if (this.#timerId) {
            clearInterval(this.#timerId);
            this.#timerId = null;
        }
        this.#lastTickTime = null;
        this.isClockRunning = false;
    }

    // Pieces ---------------------------------------------
    move(from: Position, to: Position) {
        if (this.isGameOver) return "Game is over";

        const pieceToMove = pieceAt(this.board, { row: from.row, col: from.col });
        if (!pieceToMove) return "Piece not found";

        // Validate
        const validMoves = getLegalMoves(this.board, from);
        const isValid = validMoves.some((m) => m.row === to.row && m.col === to.col);
        if (!isValid) return "Illegal move";

        // Apply pawn promotion
        const isPromotion = pieceToMove.type === "p" && (to.row === 0 || to.row === 4);
        const finalPiece = isPromotion ? { ...pieceToMove, type: "q" as const } : pieceToMove;

        // Update board state
        this.board[to.row][to.col] = finalPiece;
        this.board[from.row][from.col] = null;

        // Clock
        if (!this.isClockRunning) this.#startClock();
        else this.#lastTickTime = performance.now();

        if (this.isCheckmate || this.isStalemate) this.#stopClock();
        return true; // Valid move, executed
    }

    changeTurn() {
        this.turn = this.turn === "white" ? "black" : "white";
        return this.turn;
    }

    // Status ---------------------------------------------
    #determineWinner(): PieceColor | "draw" | null {
        if (this.whiteTime <= 0) return "black";
        if (this.blackTime <= 0) return "white";
        if (isCheckmate(this.board, this.turn)) return this.turn === "white" ? "black" : "white";
        if (isStalemate(this.board, this.turn)) return "draw";
        return null;
    }

    get status() {
        const status = {
            isCheck: isInCheck(this.board, this.turn),
            isTimeout: this.whiteTime <= 0 || this.blackTime <= 0,
            isCheckmate: isCheckmate(this.board, this.turn),
            isStalemate: isStalemate(this.board, this.turn),
            winner: this.#determineWinner(),
            isGameOver: false,
        }
        status.isGameOver = status.isTimeout || status.isCheckmate || status.isStalemate;
        return status;
    }
}