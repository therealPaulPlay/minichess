<script lang="ts">
	import Square from "$lib/components/game/Square.svelte";
	import { game } from "$lib/stores/gameStore.svelte";
	import Piece from "$lib/components/game/Piece.svelte";

	function isHighlighted(row: number, col: number, validMoves: Array<{ row: number; col: number }>) {
		return validMoves.some((m) => m.row === row && m.col === col);
	}
</script>

<div class="flex flex-col items-center justify-center gap-6 p-4 w-full flex-1">
	<div class="bg-white p-8 rounded-2xl flex flex-col relative">
		<div class="flex flex-row relative">
			<div class="grid grid-cols-5 overflow-hidden gap-1">
				{#each game.board as row, rIndex}
					{#each row as cell, cIndex}
						{const col = String.fromCharCode(97 + cIndex)}
						{const row = 5 - Math.floor(rIndex)}
						{const square = `${col}${row}`}
						{const highlighted = isHighlighted(rIndex, cIndex, game.validMoves)}
						<Square
							isDark={(cIndex + rIndex) % 2 == 0}
							{square}
							isHighlighted={highlighted}
							onclick={() => game.handleSquareClick({ row: rIndex, col: cIndex })}
						>
							{#if cell?.type && cell.color}
								<Piece type={cell.type} color={cell.color} />
							{/if}
						</Square>
					{/each}
				{/each}
			</div>
		</div>
	</div>
</div>
