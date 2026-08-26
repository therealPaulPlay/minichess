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

export class ChessGame {
    board: BoardGrid = structuredClone(initialBoard);
    turn: PieceColor = "w";

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

        if (this.turn === "w") this.whiteTime = Math.max(0, this.whiteTime - deltaSeconds);
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
        if (this.isGameOver) return;

        const pieceToMove = this.board[from.row][from.col];
        if (!pieceToMove) return;

        // Validate
        const validMoves = getLegalMoves(this.board, to);
        const isValid = validMoves.some((m) => m.row === to.row && m.col === to.col);
        if (!isValid) return false; // Invalid move, aborted

        // Apply pawn promotion
        const isPromotion = pieceToMove.type === "p" && (to.row === 0 || to.row === 4);
        const finalPiece = isPromotion ? { ...pieceToMove, type: "q" as const } : pieceToMove;

        // Update board state
        this.board[to.row][to.col] = finalPiece;
        this.board[from.row][from.col] = null;

        // Switch turn and clear active selections
        this.turn = this.turn === "w" ? "b" : "w";

        // Clock
        if (!this.isClockRunning) this.#startClock();
        else this.#lastTickTime = performance.now();

        if (this.isCheckmate || this.isStalemate) this.#stopClock();
        return true; // Valid move, executed
    }

    pieceAt(pos: Position): Piece | null {
        return this.board[pos.row][pos.col];
    }

    // Getters --------------------------------------------
    get #isTimeout() {
        return this.whiteTime <= 0 || this.blackTime <= 0;
    }

    get isCheck() {
        return isInCheck(this.board, this.turn);
    }

    get isCheckmate() {
        return isCheckmate(this.board, this.turn);
    }

    get isStalemate() {
        return isStalemate(this.board, this.turn);
    }

    get isGameOver() {
        return this.#isTimeout || this.isCheckmate || this.isStalemate;
    }

    get winner(): PieceColor | "draw" | null {
        if (this.whiteTime <= 0) return "b";
        if (this.blackTime <= 0) return "w";
        if (this.isCheckmate) return this.turn === "w" ? "b" : "w";
        if (this.isStalemate) return "draw";
        return null;
    }
}