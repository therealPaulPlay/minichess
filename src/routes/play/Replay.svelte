<script lang="ts">
	import Square from "$lib/components/game/Square.svelte";
	import Piece from "$lib/components/game/Piece.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "@lucide/svelte";
	import type { BoardGrid, Move } from "$lib/engine/types";
	import { createBoardFromMoves } from "$lib/engine/helpers";
	import { playSound } from "$lib/components/effects/sounds";

	let {
		moves = [],
		initialBoard = [],
		cellSize = 60,
	}: {
		moves?: Move[];
		initialBoard?: BoardGrid;
		cellSize?: number;
	} = $props();

	let currentMoveIndex = $state(0);
	let isPlaying = $state(false);
	let selectedSpeed = $state("1000");
	const intervalMs = $derived(Number(selectedSpeed));

	const speedOptions = [
		{ value: "1500", label: "0.5x" },
		{ value: "1000", label: "1.0x" },
		{ value: "500", label: "2.0x" },
	];

	const currentSpeedLabel = $derived(speedOptions.find((opt) => opt.value === selectedSpeed)?.label ?? "1.0x");

	const currentBoard = $derived(createBoardFromMoves(initialBoard, moves.slice(0, currentMoveIndex)));

	// Highlight the from & to squares of the last move played
	const lastMove = $derived(currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null);

	function isSquareLastMove(r: number, c: number): boolean {
		if (!lastMove) return false;
		return (lastMove.from.row === r && lastMove.from.col === c) || (lastMove.to.row === r && lastMove.to.col === c);
	}

	$effect(() => {
		if (!isPlaying) return;

		const timer = setInterval(() => {
			if (currentMoveIndex < moves.length) {
				currentMoveIndex++;
				playSound("move");
			} else {
				// Reached the end
				isPlaying = false;
			}
		}, intervalMs);

		return () => clearInterval(timer);
	});

	// Controls
	function togglePlay() {
		// If at the end, restart from move 0
		if (currentMoveIndex >= moves.length) {
			currentMoveIndex = 0;
		}
		isPlaying = !isPlaying;
	}

	function stepForward() {
		isPlaying = false;
		if (currentMoveIndex < moves.length) {
			currentMoveIndex++;
			playSound("move");
		}
	}

	function stepBackward() {
		isPlaying = false;
		if (currentMoveIndex > 0) {
			currentMoveIndex--;
			playSound("move");
		}
	}

	function jumpToStart() {
		isPlaying = false;
		currentMoveIndex = 0;
	}

	function jumpToEnd() {
		isPlaying = false;
		currentMoveIndex = moves.length;
	}
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<!-- Board -->
	<div class="relative flex flex-col rounded-2xl bg-white p-4 shadow-xl">
		<div class="grid grid-cols-5">
			{#each currentBoard as row, r}
				{#each row as piece, c}
					{@const isDark = (r + c) % 2 === 1}
					{@const isHighlighted = isSquareLastMove(r, c)}

					<Square {isDark} {isHighlighted} {cellSize} row={r} col={c} {piece} showSword={false}>
						{#if piece}
							<Piece type={piece.type} color={piece.color} draggable={false} />
						{/if}
					</Square>
				{/each}
			{/each}
		</div>
	</div>

	<!-- Replay control bar -->
	<div
		class="bg-muted/60 border-border/60 flex max-w-full items-center justify-center gap-1 rounded-full border px-1 py-1"
	>
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 cursor-pointer"
			disabled={currentMoveIndex === 0}
			onclick={jumpToStart}
			title="First Move"
		>
			<SkipBack class="size-3.5" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 cursor-pointer"
			disabled={currentMoveIndex === 0}
			onclick={stepBackward}
			title="Previous Move"
		>
			<ChevronLeft class="size-3.5" />
		</Button>
		<Button
			variant="default"
			size="icon"
			class="h-7 w-7 cursor-pointer"
			onclick={togglePlay}
			title={isPlaying ? "Pause" : "Play"}
		>
			{#if isPlaying}
				<Pause class="size-3.5" />
			{:else}
				<Play class="ml-0.5 size-3.5" />
			{/if}
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 cursor-pointer"
			disabled={currentMoveIndex >= moves.length}
			onclick={stepForward}
			title="Next Move"
		>
			<ChevronRight class="size-3.5" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 cursor-pointer"
			disabled={currentMoveIndex >= moves.length}
			onclick={jumpToEnd}
			title="Last Move"
		>
			<SkipForward class="size-3.5" />
		</Button>
		<!-- Move counter -->
		<div class="text-muted-foreground mx-1 text-xs font-semibold select-none">
			{currentMoveIndex}/{moves.length}
		</div>
		<!-- Speed select -->
		<Select.Root type="single" bind:value={selectedSpeed}>
			<Select.Trigger class="cursor-pointer px-3 text-xs">
				{currentSpeedLabel}
			</Select.Trigger>
			<Select.Content class="rounded-xl p-1">
				{#each speedOptions as opt}
					<Select.Item value={opt.value} label={opt.label} class="cursor-pointer text-xs">
						{opt.label}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
</div>
