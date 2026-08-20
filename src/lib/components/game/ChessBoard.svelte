<script lang="ts">
	import Square from "$lib/components/game/Square.svelte";
	import { game } from "$lib/stores/gameStore.svelte";
	import Piece from "$lib/components/game/Piece.svelte";
	import type { Attachment } from "svelte/attachments";
	import type { Position } from "$lib/engine/types";

	let board;

	function isHighlighted(row: number, col: number, validMoves: Array<{ row: number; col: number }>) {
		return validMoves.some((m) => m.row === row && m.col === col);
	}

	function draggable(row: number, col: number): Attachment<HTMLElement> {
		return (node) => {
			function preventNativeDrag(e: DragEvent) {
				e.preventDefault();
			}
			node.addEventListener("dragstart", preventNativeDrag);

			let startX = 0;
			let startY = 0;

			// move
			function onPointerMove(e: PointerEvent) {
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;

				node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
			}

			// let go
			function onPointerUp(e: PointerEvent) {
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);

				node.style.transform = "translate3d(0, 0, 0)";

				if (node.hasPointerCapture(e.pointerId)) {
					node.releasePointerCapture(e.pointerId);
				}
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

				const maxSnapRadius = 80; // in pixels
				if (closestSquare && minDistanceSq <= maxSnapRadius ** 2) {
					const dropRow = parseInt(closestSquare.dataset.row!);
					const dropCol = parseInt(closestSquare.dataset.col!);

					game.handleSquareClick({ row: dropRow, col: dropCol } as Position);
				}

				node.style.zIndex = "";
			}

			// click
			function onPointerDown(e: PointerEvent) {
				if (e.button !== 0 && e.pointerType === "mouse") return;

				// can't drag the opponent's piece (for now, user should be only able to drag his pieces regardless of turn)
				if (game.pieceAt({ row, col })?.color !== game.turn) return;

				startX = e.clientX;
				startY = e.clientY;

				node.setPointerCapture(e.pointerId);
				node.style.cursor = "grabbing";
				node.style.zIndex = "30";

				// Start listening for movement and release
				window.addEventListener("pointermove", onPointerMove);
				window.addEventListener("pointerup", onPointerUp);

				node.style.cursor = "grabbing";

				game.handleSquareClick({ row, col } as Position);
			}

			node.addEventListener("pointerdown", onPointerDown);

			return () => {
				// cleanup
				node.removeEventListener("pointerdown", onPointerDown);
				window.removeEventListener("pointermove", onPointerMove);
				window.removeEventListener("pointerup", onPointerUp);
				node.removeEventListener("dragstart", preventNativeDrag);
			};
		};
	}
</script>

<div class="flex w-full flex-1 flex-col items-center justify-center gap-6 p-4">
	<div class="relative flex flex-col rounded-2xl bg-white p-8">
		<div class="relative flex flex-row">
			<div class="grid grid-cols-5 overflow-hidden" bind:this={board}>
				{#each game.board as row, rIndex}
					{#each row as cell, cIndex}
						{const col = $derived(String.fromCharCode(97 + cIndex))}
						{const rowLabel = $derived(5 - Math.floor(rIndex))}
						{const square = $derived(`${col}${rowLabel}`)}
						{const highlighted = $derived(isHighlighted(rIndex, cIndex, game.validMoves))}
						<Square
							isDark={(cIndex + rIndex) % 2 == 0}
							{square}
							row={rIndex}
							col={cIndex}
							isHighlighted={highlighted}
							piece={cell?.type && cell?.color ? cell : null}
							onclick={() => game.handleSquareClick({ row: rIndex, col: cIndex })}
						>
							{#if cell?.type && cell.color}
								<Piece type={cell.type} color={cell.color} {@attach draggable(rIndex, cIndex)} />
							{/if}
						</Square>
					{/each}
				{/each}
			</div>
		</div>
	</div>
</div>
