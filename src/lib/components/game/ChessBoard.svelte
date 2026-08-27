<script lang="ts">
	import Square from "$lib/components/game/Square.svelte";
	import Piece from "$lib/components/game/Piece.svelte";
	import type { Attachment } from "svelte/attachments";
	import type { Position, Piece as PieceData } from "$lib/engine/types";
	import TurnIndicator from "./TurnIndicator.svelte";
	import Progress from "$lib/components/ui/progress/progress.svelte";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import { pieceAt } from "$lib/engine/helpers";
	import { getLegalMoves } from "$lib/engine/rules";

	// TODO: Switch to better timer solution for multiplayer
	// My idea: We store the timestamps for both black and white when their turn started + ended, and calculate the time left on the client by using the differences
	// This would be time-zone independent and would only need syncing once each turn
	const blackTimeLeft = $derived(
		Math.min(
			100,
			Math.max(0, (multiplayerState.storage.blackTime / multiplayerState.storage.INITIAL_TIME_SECONDS) * 100),
		),
	);
	const whiteTimeLeft = $derived(
		Math.min(
			100,
			Math.max(0, (multiplayerState.storage.whiteTime / multiplayerState.storage.INITIAL_TIME_SECONDS) * 100),
		),
	);

	const MAX_SNAP_RADIUS = 80; // Radius in px

	// Current selected position & valid moves for that position
	let selectedPos: Position | null = $state(null);
	const validMoves = $derived(
		multiplayerState.storage?.board && selectedPos ? getLegalMoves(multiplayerState.storage?.board, selectedPos) : [],
	);

	async function handleClickAndMove(pos: Position) {
		const board = multiplayerState.storage?.board;
		if (!board) return console.warn("Board not loaded.");

		// Clicked on one's own piece, select it
		// TODO: Ensure whoever plays white can only select white, and whoever plays black can only select black
		const clickedPiece = board[pos.row]?.[pos.col];
		if (clickedPiece?.color === multiplayerState.storage?.turn) return (selectedPos = pos);

		// Anything else is a move target for the current selection, empty squares included
		if (selectedPos) {
			const isValid = validMoves.some((m) => m.row === pos.row && m.col === pos.col);
			if (isValid) {
				const from = selectedPos;
				selectedPos = null; // Deselect before the request
				try {
					// TODO: Don't use a request here, insetad append to an array of moves from which we reconstruct the current board
					await multiplayerState.socket?.sendRequest("move-piece", { currentPos: from, newPos: pos });
				} catch (error) {
					// TODO: proper user-facing error handling
					console.error("Error moving piece:", error);
				}
				return;
			}
		}

		selectedPos = null;
	}

	// Most of this code is for the drag-and-drop effect
	function draggable(row: number, col: number): Attachment<HTMLElement> {
		return (node) => {
			node.addEventListener("dragstart", (e) => e.preventDefault());

			let startX = 0;
			let startY = 0;

			// Move
			function onPointerMove(e: PointerEvent) {
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;

				node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
			}

			// Let go
			function onPointerUp(e: PointerEvent) {
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);

				node.style.transform = "translate3d(0, 0, 0)";

				if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
				node.style.cursor = "";

				const squares = document.querySelectorAll<HTMLElement>("[data-square]");
				if (!squares.length) return;

				let closestSquare: HTMLElement | null = null;
				let minDistanceSq = Infinity;

				for (const sq of squares) {
					const rect = sq.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;

					const distSq = (e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2;

					if (distSq < minDistanceSq) {
						minDistanceSq = distSq;
						closestSquare = sq;
					}
				}

				if (closestSquare && minDistanceSq <= MAX_SNAP_RADIUS ** 2) {
					const dropRow = parseInt(closestSquare.dataset.row!);
					const dropCol = parseInt(closestSquare.dataset.col!);

					handleClickAndMove({ row: dropRow, col: dropCol } as Position);
				}

				node.style.zIndex = "";
			}

			// Click
			function onPointerDown(e: PointerEvent) {
				if (e.button !== 0 && e.pointerType === "mouse") return;

				// Can't drag the opponent's piece (for now, user should be only able to drag his pieces regardless of turn)
				if (pieceAt(multiplayerState.storage?.board, { row, col })?.color !== multiplayerState.storage.turn) return;

				startX = e.clientX;
				startY = e.clientY;

				node.setPointerCapture(e.pointerId);
				node.style.cursor = "grabbing";
				node.style.zIndex = "30";

				// Start listening for movement and release
				window.addEventListener("pointermove", onPointerMove);
				window.addEventListener("pointerup", onPointerUp);

				node.style.cursor = "grabbing";

				handleClickAndMove({ row, col } as Position);
			}

			node.addEventListener("pointerdown", onPointerDown);

			return () => {
				// Cleanup
				node.removeEventListener("pointerdown", onPointerDown);
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);
				node.removeEventListener("dragstart", (e) => e.preventDefault());
			};
		};
	}

	function isHighlighted(row: number, col: number, validMoves: Array<Position>) {
		return validMoves.some((m) => m.row === row && m.col === col);
	}
</script>

<div class="flex w-full flex-1 flex-col items-center justify-center gap-6 p-4">
	<div class="relative flex flex-col rounded-2xl bg-white p-8">
		<div class="relative flex flex-row">
			<div class="grid grid-cols-5 overflow-hidden">
				{#if multiplayerState.storage?.board}
					{#each multiplayerState.storage.board as row, rIndex}
						{#each row as cell, cIndex}
							{const col = $derived(String.fromCharCode(97 + cIndex))}
							{const rowLabel = $derived(5 - Math.floor(rIndex))}
							{const square = $derived(`${col}${rowLabel}`)}
							{const highlighted = $derived(isHighlighted(rIndex, cIndex, validMoves))}
							<Square
								isDark={(cIndex + rIndex) % 2 == 0}
								{square}
								row={rIndex}
								col={cIndex}
								isHighlighted={highlighted}
								piece={cell?.type && cell?.color ? cell : null}
							>
								{#if cell?.type && cell.color}
									<Piece
										type={cell.type}
										color={cell.color}
										draggable={cell.color === multiplayerState.storage?.turn}
										{@attach draggable(rIndex, cIndex)}
									/>
								{/if}
							</Square>
						{/each}
					{/each}
				{:else}
					<p>Board not transmitted by server.</p>
				{/if}
			</div>
			<div class="absolute -right-8 flex h-full translate-x-full scale-150 items-center justify-center">
				<TurnIndicator />
			</div>
			<div class="absolute -top-6 z-50 w-full opacity-50">
				<Progress value={blackTimeLeft} />
			</div>
			<div class="absolute -bottom-6 z-50 w-full opacity-50">
				<Progress value={whiteTimeLeft} />
			</div>
		</div>
	</div>
</div>
