<script lang="ts">
	import Square from "$lib/components/game/Square.svelte";
	import Piece from "$lib/components/game/Piece.svelte";
	import type { Attachment } from "svelte/attachments";
	import type { BoardGrid, Move, PieceColor, Position } from "$lib/engine/types";
	import TurnIndicator from "./TurnIndicator.svelte";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import { applyMove, pieceAt } from "$lib/engine/helpers";
	import { getLegalMoves } from "$lib/engine/rules";
	import { playSound } from "../effects/sounds";

	const MAX_SNAP_RADIUS = 80; // Radius in px
	const INITIAL_TIME_MS = 300_000;

	let blackTimeLeft = $state(INITIAL_TIME_MS);
	let whiteTimeLeft = $state(INITIAL_TIME_MS);
	let turn: PieceColor = $state("white");

	let captureTriggers = $state<Record<string, number>>({});
	let localBoard = $state<BoardGrid | null>(null);
	let localMoves: Move[] = [];

	$effect(() => {
		const initial = multiplayerState.storage.meta?.initialBoard;
		if (!initial) return;

		const serverMoves = multiplayerState.storage.moveHistory || [];

		const isSameMove = (a: Move, b: Move) =>
			a.from.row === b.from.row &&
			a.from.col === b.from.col &&
			a.to.row === b.to.row &&
			a.to.col === b.to.col &&
			a.promotion === b.promotion;

		const hasDiverged =
			localMoves.length > serverMoves.length || localMoves.some((move, i) => !isSameMove(move, serverMoves[i]));
		if (hasDiverged || !localBoard) {
			localBoard = $state.snapshot(initial);
			localMoves = [];
		}

		const newMoves = serverMoves.slice(localMoves.length);

		for (const move of newMoves) {
			const pieceAtTarget = pieceAt(localBoard, move.to);
			if (pieceAtTarget) {
				const square = `${String.fromCharCode(97 + move.to.col)}${5 - move.to.row}`;
				captureTriggers[square] = (captureTriggers[square] || 0) + 1; // triggers ImpactDust
				playSound("capture");
			} else {
				playSound("move");
			}

			applyMove(localBoard, move);
			localMoves.push(move);
		}
	});

	$effect(() => {
		const status = multiplayerState.storage.status;
		if (!status) return;

		// Update base times from server
		whiteTimeLeft = status.whiteTime ?? INITIAL_TIME_MS;
		blackTimeLeft = status.blackTime ?? INITIAL_TIME_MS;
		turn = status.turn || "white";

		// If game is over or clock hasn't started yet, don't run an animation loop
		if (status?.isGameOver || !status.turnStartedAt) return;

		const baseWhite = status.whiteTime ?? INITIAL_TIME_MS;
		const baseBlack = status.blackTime ?? INITIAL_TIME_MS;
		const startedAt = status.turnStartedAt;
		const activeTurn = status.turn;

		// Update the active clock
		const interval = setInterval(() => {
			const elapsed = Date.now() - startedAt;
			if (activeTurn === "white") {
				whiteTimeLeft = Math.max(0, baseWhite - elapsed);
			} else {
				blackTimeLeft = Math.max(0, baseBlack - elapsed);
			}
		}, 50);
		return () => clearInterval(interval);
	});

	const whitePercentage = $derived((whiteTimeLeft / INITIAL_TIME_MS) * 100);
	const blackPercentage = $derived((blackTimeLeft / INITIAL_TIME_MS) * 100);

	const canPlay = $derived.by(() => {
		const userId = multiplayerState.socket?.id;
		const storage = multiplayerState.storage;
		if (!storage || !userId) return false;

		const activePlayer = storage.status?.turn === "white" ? storage.meta?.whiteId : storage.meta?.blackId;

		return activePlayer === userId;
	});

	// Current selected position & valid moves for that position
	let selectedPos: Position | null = $state(null);
	const validMoves = $derived(localBoard && selectedPos ? getLegalMoves(localBoard, selectedPos) : []);

	async function handleClickAndMove(pos: Position) {
		const gameStatus = multiplayerState.storage.status;
		if (!gameStatus) return;

		if (!localBoard) return console.warn("Board not loaded.");

		if (!canPlay) return;

		const clickedPiece = localBoard[pos.row]?.[pos.col];
		if (clickedPiece?.color === gameStatus.turn) return (selectedPos = pos);

		// Anything else is a move target for the current selection, empty squares included
		if (selectedPos) {
			const isValid = validMoves.some((m) => m.row === pos.row && m.col === pos.col);
			if (isValid) {
				const from = selectedPos;
				selectedPos = null; // Deselect before the request
				try {
					const move = { from, to: pos };
					multiplayerState.socket?.updateStorage("moveHistory", "array-add", move);
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
			if (!localBoard) return () => {};

			const clickedPieceColor = localBoard[row]?.[col]?.color;
			if (clickedPieceColor !== userColor()) return () => {};

			node.addEventListener("dragstart", (e) => e.preventDefault());

			let startX = 0;
			let startY = 0;
			let lastX = 0;
			let currentTilt = 0;

			// Move
			function onPointerMove(e: PointerEvent) {
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;

				// Tilt
				const vx = e.clientX - lastX;
				lastX = e.clientX;
				const targetTilt = Math.min(Math.max(vx * 25, -25), 25);
				currentTilt += (targetTilt - currentTilt) * 0.1;

				node.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.1) rotate(${currentTilt}deg)`;
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
				const gameStatus = multiplayerState.storage.status;
				if (!gameStatus) return;

				// Can't drag the opponent's piece (for now, user should be only able to drag his pieces regardless of turn)
				if (!localBoard || pieceAt(localBoard, { row, col })?.color !== gameStatus.turn) return;

				startX = e.clientX;
				startY = e.clientY;
				lastX = e.clientX;

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

	function userColor(): PieceColor {
		return multiplayerState.storage.meta?.whiteId === multiplayerState.socket?.id ? "white" : "black";
	}
</script>

<div class="flex w-full flex-1 flex-col items-center justify-center gap-6">
	<div class="relative flex flex-col rounded-2xl bg-white">
		<div class="relative flex flex-row">
			<div class="grid grid-cols-5">
				{#if localBoard}
					{#each localBoard as row, rIndex}
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
								onclick={() => handleClickAndMove({ row: rIndex, col: cIndex })}
							>
								{#if cell?.type && cell.color}
									<Piece
										type={cell.type}
										color={cell.color}
										draggable={cell.color === userColor()}
										triggerEffect={captureTriggers[square] || 0}
										{@attach draggable(rIndex, cIndex)}
										isUnderAttack={validMoves.some((m) => m.row === rIndex && m.col === cIndex)}
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
				<TurnIndicator {whitePercentage} {blackPercentage} {turn} sideIndicator={userColor()} />
			</div>
		</div>
	</div>
</div>
