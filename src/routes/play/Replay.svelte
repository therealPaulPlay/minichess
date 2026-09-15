<script lang="ts">
	import { tick } from "svelte";
	import Square from "$lib/components/game/Square.svelte";
	import Piece from "$lib/components/game/Piece.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Download } from "@lucide/svelte";
	import type { BoardGrid, Move, PieceColor, Piece as PieceTypeAndColor } from "$lib/engine/types";
	import { createBoardFromMoves } from "$lib/engine/helpers";
	import { playSound } from "$lib/components/effects/sounds";
	import { generateReplayGif } from "$lib/utils/gifGenerator";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import { toast } from "svelte-sonner";

	let {
		moves = [],
		initialBoard = [],
		cellSize = 60,
		winner = "draw",
		isFlipped = false,
	}: {
		moves?: Move[];
		initialBoard?: BoardGrid;
		cellSize?: number;
		winner?: PieceColor | "draw";
		isFlipped?: boolean;
	} = $props();

	let isGeneratingGif = $state(false);

	async function downloadGif() {
		if (isGeneratingGif || moves.length === 0) return;
		if (isPlaying) {
			isPlaying = false;
			cancelPause();
		}
		try {
			isGeneratingGif = true;
			const blob = await generateReplayGif(initialBoard, moves, {
				isFlipped,
				winner,
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `minichess-replay-${Date.now()}.gif`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error("Failed to generate GIF:", err);
			toast.error("Failed to generate GIF");
		} finally {
			isGeneratingGif = false;
		}
	}

	let currentMoveIndex = $state(0);
	let previousMovesLength: number | null = null;
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

	// In-flight animation state
	let activeAnim = $state<{
		piece: PieceTypeAndColor;
		move: Move;
		startX: number;
		startY: number;
	} | null>(null);

	let ascendingSouls = $state<
		Array<{
			id: number;
			piece: PieceTypeAndColor;
			x: number;
			y: number;
		}>
	>([]);

	let animatingElRef: HTMLDivElement | null = $state(null);
	let activeAnimationInstance: Animation | null = null;
	let captureTriggers = $state<Record<string, number>>({});
	let pauseResolver: (() => void) | null = null;
	let autoPlayRunning = false;

	// Highlight the from & to squares of the active move or the last move played
	const lastMove = $derived(currentMoveIndex > 0 ? moves[currentMoveIndex - 1] : null);

	function isSquareLastMove(r: number, c: number): boolean {
		const targetMove = activeAnim ? activeAnim.move : lastMove;
		if (!targetMove) return false;
		return (
			(targetMove.from.row === r && targetMove.from.col === c) ||
			(targetMove.to.row === r && targetMove.to.col === c)
		);
	}

	const rowIndices = $derived(isFlipped ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4]);
	const colIndices = $derived(isFlipped ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4]);

	function getSquarePixelPos(r: number, c: number) {
		const visualCol = isFlipped ? 4 - c : c;
		const visualRow = isFlipped ? 4 - r : r;
		return {
			x: visualCol * cellSize,
			y: visualRow * cellSize,
		};
	}

	function getAnimDuration(interval: number): number {
		return Math.max(160, Math.min(450, Math.round(interval * 0.35)));
	}

	function computeLateralBezierKeyframes(
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
		cellSize: number,
		steps = 28,
	): Keyframe[] {
		const dx = toX - fromX;
		const dy = toY - fromY;
		const dist = Math.hypot(dx, dy);

		if (dist < 1) {
			return [
				{ transform: `translate3d(${fromX}px, ${fromY}px, 0)` },
				{ transform: `translate3d(${toX}px, ${toY}px, 0)` },
			];
		}

		// Normal vector perpendicular to movement direction
		const nx = -dy / dist;
		const ny = dx / dist;

		// Midpoint
		const mx = (fromX + toX) / 2;
		const my = (fromY + toY) / 2;

		// Curvature magnitude (proportional to distance, bounded for elegance)
		const h = Math.min(50, Math.max(22, dist * 0.22));

		// Center of 5x5 board container
		const boardCenter = 2 * cellSize;
		const toCenterVecX = boardCenter - mx;
		const toCenterVecY = boardCenter - my;

		// Curve inward towards board center when appropriate
		const dot = nx * toCenterVecX + ny * toCenterVecY;
		const sign = Math.abs(dot) > 10 ? (dot > 0 ? 1 : -1) : 1;

		const pcX = mx + nx * h * sign;
		const pcY = my + ny * h * sign;

		const keyframes: Keyframe[] = [];
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const oneMinusT = 1 - t;
			const x = oneMinusT * oneMinusT * fromX + 2 * oneMinusT * t * pcX + t * t * toX;
			const y = oneMinusT * oneMinusT * fromY + 2 * oneMinusT * t * pcY + t * t * toY;

			const sinT = Math.sin(Math.PI * t);
			const tilt = sign * 5 * sinT;

			keyframes.push({
				transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`,
			});
		}

		return keyframes;
	}

	function cancelActiveAnimation() {
		if (activeAnimationInstance) {
			try {
				activeAnimationInstance.cancel();
			} catch {}
			activeAnimationInstance = null;
		}
		activeAnim = null;
		ascendingSouls = [];
	}

	function cancelPause() {
		if (pauseResolver) {
			pauseResolver();
			pauseResolver = null;
		}
	}

	function waitPause(ms: number) {
		return new Promise<void>((resolve) => {
			const timer = setTimeout(() => {
				pauseResolver = null;
				resolve();
			}, ms);
			pauseResolver = () => {
				clearTimeout(timer);
				resolve();
			};
		});
	}

	async function playAnimatedMove(moveIdx: number): Promise<boolean> {
		if (moveIdx >= moves.length) return false;

		const move = moves[moveIdx];
		const boardBeforeMove = createBoardFromMoves(initialBoard, moves.slice(0, moveIdx));
		const movingPiece = boardBeforeMove[move.from.row]?.[move.from.col];
		const targetPiece = boardBeforeMove[move.to.row]?.[move.to.col];

		if (!movingPiece) {
			currentMoveIndex = moveIdx + 1;
			playSound("move");
			return true;
		}

		const fromPos = getSquarePixelPos(move.from.row, move.from.col);
		const toPos = getSquarePixelPos(move.to.row, move.to.col);

		activeAnim = {
			piece: movingPiece,
			move,
			startX: fromPos.x,
			startY: fromPos.y,
		};

		await tick();

		if (!animatingElRef) {
			currentMoveIndex = moveIdx + 1;
			activeAnim = null;
			return true;
		}

		const duration = getAnimDuration(intervalMs);
		const keyframes = computeLateralBezierKeyframes(
			fromPos.x,
			fromPos.y,
			toPos.x,
			toPos.y,
			cellSize,
		);

		const animation = animatingElRef.animate(keyframes, {
			duration,
			easing: "cubic-bezier(0.2, 0.7, 0.6, 0.75)",
			fill: "forwards",
		});
		activeAnimationInstance = animation;

		try {
			await animation.finished;
		} catch {
			return false;
		} finally {
			if (activeAnimationInstance === animation) {
				activeAnimationInstance = null;
			}
			activeAnim = null;
		}

		currentMoveIndex = moveIdx + 1;

		const isPromotion = Boolean(
			move.promotion || (movingPiece.type === "p" && (move.to.row === 0 || move.to.row === 4)),
		);

		if (isPromotion) {
			playSound("promotion");
		} else if (targetPiece) {
			playSound("capture");
			const square = `${String.fromCharCode(97 + move.to.col)}${5 - move.to.row}`;
			captureTriggers[square] = (captureTriggers[square] || 0) + 1;

			// Trigger ascending soul effect for captured piece
			const soulId = Date.now() + Math.random();
			ascendingSouls.push({
				id: soulId,
				piece: targetPiece,
				x: toPos.x,
				y: toPos.y,
			});
			setTimeout(() => {
				ascendingSouls = ascendingSouls.filter((s) => s.id !== soulId);
			}, 450);
		} else {
			playSound("move");
		}

		return true;
	}

	async function runAutoPlay() {
		if (autoPlayRunning) return;
		autoPlayRunning = true;

		try {
			while (isPlaying && currentMoveIndex < moves.length) {
				const nextIdx = currentMoveIndex;
				const success = await playAnimatedMove(nextIdx);
				if (!success || !isPlaying) break;

				const pauseTime = Math.max(120, intervalMs - getAnimDuration(intervalMs));
				await waitPause(pauseTime);
			}
		} finally {
			autoPlayRunning = false;
			if (currentMoveIndex >= moves.length) {
				isPlaying = false;
			}
		}
	}

	$effect(() => {
		if (previousMovesLength !== moves.length) {
			previousMovesLength = moves.length;
			cancelActiveAnimation();
			cancelPause();
			isPlaying = false;
			currentMoveIndex = moves.length;
		}
	});

	$effect(() => {
		if (isPlaying) {
			runAutoPlay();
		}
	});

	$effect(() => {
		return () => {
			isPlaying = false;
			cancelPause();
			cancelActiveAnimation();
		};
	});

	// Controls
	function togglePlay() {
		if (currentMoveIndex >= moves.length) currentMoveIndex = 0;

		if (isPlaying) {
			isPlaying = false;
			cancelPause();
		} else {
			isPlaying = true;
		}
	}

	async function stepForward() {
		if (isPlaying) {
			isPlaying = false;
			cancelPause();
		}
		if (activeAnimationInstance) {
			activeAnimationInstance.finish();
			await tick();
		}
		if (currentMoveIndex < moves.length) {
			await playAnimatedMove(currentMoveIndex);
		}
	}

	function stepBackward() {
		if (isPlaying) {
			isPlaying = false;
			cancelPause();
		}
		cancelActiveAnimation();
		if (currentMoveIndex > 0) {
			currentMoveIndex--;
			playSound("move");
		}
	}

	function jumpToStart() {
		if (isPlaying) {
			isPlaying = false;
			cancelPause();
		}
		cancelActiveAnimation();
		currentMoveIndex = 0;
	}

	function jumpToEnd() {
		if (isPlaying) {
			isPlaying = false;
			cancelPause();
		}
		cancelActiveAnimation();
		currentMoveIndex = moves.length;
	}
</script>

<div class="flex flex-col items-center justify-center gap-4">
	<!-- Board -->
	<div class="relative flex flex-col items-center rounded-2xl bg-white p-2 shadow-xl">
		<div class="relative grid grid-cols-5">
			{#each rowIndices as r}
				{#each colIndices as c}
					{const piece = $derived(currentBoard[r]?.[c])}
					{const isDark = $derived((r + c) % 2 === 0)}
					{const isHighlighted = $derived(isSquareLastMove(r, c))}
					{const isOriginOfActiveAnim = $derived(
						Boolean(activeAnim && activeAnim.move.from.row === r && activeAnim.move.from.col === c),
					)}

					<Square {isDark} {isHighlighted} {cellSize} row={r} col={c} {piece} showSword={false} showDot={true}>
						{#if piece && !isOriginOfActiveAnim}
							<Piece
								type={piece.type}
								color={piece.color}
								draggable={false}
								triggerEffect={captureTriggers[`${String.fromCharCode(97 + c)}${5 - r}`] || 0}
								isDead={winner !== "draw" &&
									piece.color !== winner &&
									piece.type === "k" &&
									currentMoveIndex === moves.length}
							/>
						{/if}
					</Square>
				{/each}
			{/each}

			{#if activeAnim}
				<div
					bind:this={animatingElRef}
					class="pointer-events-none absolute top-0 left-0 z-30 flex items-center justify-center"
					style="width: {cellSize}px; height: {cellSize}px; transform: translate3d({activeAnim.startX}px, {activeAnim.startY}px, 0); will-change: transform;"
				>
					<Piece
						type={activeAnim.piece.type}
						color={activeAnim.piece.color}
						draggable={false}
					/>
				</div>
			{/if}

			{#each ascendingSouls as soul (soul.id)}
				<div
					class="pointer-events-none absolute top-0 left-0 z-40 flex items-center justify-center"
					style="width: {cellSize}px; height: {cellSize}px; transform: translate3d({soul.x}px, {soul.y}px, 0);"
				>
					<div class="soul-ascend flex h-full w-full items-center justify-center">
						<Piece
							type={soul.piece.type}
							color={soul.piece.color}
							draggable={false}
						/>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Replay control bar -->
	<div class="flex w-full max-w-full items-center justify-between gap-1">
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
		<div class="text-muted-foreground mx-1 min-w-12 text-center text-xs font-semibold select-none">
			{currentMoveIndex}/{moves.length}
		</div>
		<!-- Speed select -->
		<Select.Root type="single" bind:value={selectedSpeed}>
			<Select.Trigger class="cursor-pointer px-3 text-xs select-none">
				{currentSpeedLabel}
			</Select.Trigger>
			<Select.Content class="rounded-xl p-1">
				{#each speedOptions as opt}
					<Select.Item value={opt.value} label={opt.label} class="cursor-pointer text-xs select-none">
						{opt.label}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<!-- Download GIF button -->
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7 cursor-pointer"
			disabled={isGeneratingGif || moves.length === 0}
			onclick={downloadGif}
			title="Download GIF"
		>
			{#if isGeneratingGif}
				<Spinner class="size-3.5" />
			{:else}
				<Download class="size-3.5" />
			{/if}
		</Button>
	</div>
</div>

<style>
	:global(.soul-ascend) {
		animation: soul-ascend 400ms cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
		will-change: transform, opacity, filter;
		pointer-events: none;
	}

	@keyframes soul-ascend {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 0.9;
			filter: brightness(1.2);
		}
		35% {
			opacity: 0.45;
			filter: brightness(1.6) drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
		}
		100% {
			transform: translateY(-28px) rotate(-6deg);
			opacity: 0;
			filter: brightness(2.2) blur(2px) drop-shadow(0 0 10px rgba(255, 255, 255, 0));
		}
	}
</style>
