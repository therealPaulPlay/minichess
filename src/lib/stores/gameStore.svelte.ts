import { getLegalMoves } from '../engine/rules'
import type { BoardGrid, Position, PieceColor } from '../engine/types'

const initialBoard: BoardGrid = [
    [
        { type: 'r', color: 'b' },
        { type: 'n', color: 'b' },
        { type: 'b', color: 'b' },
        { type: 'q', color: 'b' },
        { type: 'k', color: 'b' },
    ],
    [
        { type: 'p', color: 'b' },
        { type: 'p', color: 'b' },
        { type: 'p', color: 'b' },
        { type: 'p', color: 'b' },
        { type: 'p', color: 'b' },
    ],
    [null, null, null, null, null],
    [
        { type: 'p', color: 'w' },
        { type: 'p', color: 'w' },
        { type: 'p', color: 'w' },
        { type: 'p', color: 'w' },
        { type: 'p', color: 'w' },
    ],
    [
        { type: 'r', color: 'w' },
        { type: 'n', color: 'w' },
        { type: 'b', color: 'w' },
        { type: 'q', color: 'w' },
        { type: 'k', color: 'w' },
    ],
]

function createGame() {
    let board = $state<BoardGrid>(initialBoard)
    let turn = $state<PieceColor>('w')
    let selectedPos = $state<Position | null>(null)
    let validMoves = $state<Position[]>([])

    return {
        get board() { return board },
        get turn() { return turn },
        get selectedPos() { return selectedPos },
        get validMoves() { return validMoves },

        handleSquareClick(pos: Position) {
            const clickedPiece = board[pos.row][pos.col]

            // Clicking own piece
            if (clickedPiece && clickedPiece.color === turn) {
                selectedPos = pos
                validMoves = getLegalMoves(board, pos)
                return
            }

            // Moving selected piece
            if (selectedPos) {
                const isValid = validMoves.some(
                    (m) => m.row === pos.row && m.col === pos.col
                )

                if (isValid) {
                    const pieceToMove = board[selectedPos.row][selectedPos.col]

                    board[pos.row][pos.col] = pieceToMove
                    board[selectedPos.row][selectedPos.col] = null

                    // Pawn promotion
                    if (pieceToMove?.type === 'p' && (pos.row === 0 || pos.row === 4)) {
                        pieceToMove.type = 'q'
                    }

                    turn = turn === 'w' ? 'b' : 'w'
                    selectedPos = null
                    validMoves = []
                    return
                }
            }

            // Deselect
            selectedPos = null
            validMoves = []
        },

        reset() {
            board = initialBoard
            turn = 'w'
            selectedPos = null
            validMoves = []
        }
    }
}

export const game = createGame()