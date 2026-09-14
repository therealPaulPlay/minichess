<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/ui/button/button.svelte";
	import Square from "$lib/components/game/Square.svelte";
	import Piece from "$lib/components/game/Piece.svelte";
	import type { BoardGrid } from "$lib/engine/types";
	import { ArrowLeft } from "@lucide/svelte";

	const startingBoard: BoardGrid = [
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

	const files = ["a", "b", "c", "d", "e"];
	const ranks = ["5", "4", "3", "2", "1"];
</script>

<svelte:head>
	<title>How to Play - Minichess Guide & Rules</title>
	<meta
		name="description"
		content="Rules and guide for Minichess: the fast, tactical 5x5 chess variant. Learn piece movements, promotions, and strategic differences."
	/>
</svelte:head>

<main class="flex min-h-screen w-full flex-col items-center bg-zinc-100 px-6 py-16 text-slate-900">
	<div class="flex w-full max-w-lg flex-col gap-12">
		<!-- Header -->
		<header class="flex flex-col gap-4">
			<Button
				variant="ghost"
				size="sm"
				class="-ml-3 w-fit cursor-pointer gap-2 text-zinc-500 hover:text-zinc-900"
				onclick={() => goto("/")}
			>
				<ArrowLeft size={16} />
				<span>Back</span>
			</Button>

			<div class="flex flex-col gap-2">
				<h1 class="text-4xl font-extralight tracking-tight text-zinc-900">Minichess Rules</h1>
				<p class="text-sm leading-relaxed text-zinc-600">
					A 5×5 tactical chess variant created by Martin Gardner in 1962 and standardized by the AISE. All pieces move
					identically to standard chess, condensed into an intense short-range battle where tactics begin on move one.
				</p>
			</div>
		</header>

		<!-- Starting Position Board (Seamless, card-free) -->
		<section class="flex flex-col items-center gap-4">
			<div class="relative flex flex-col items-center">
				<div class="flex flex-row items-center">
					<!-- Rank labels -->
					<div class="mr-3 flex flex-col justify-around font-mono text-xs text-zinc-400 select-none">
						{#each ranks as rank}
							<span class="flex h-11 items-center justify-center">{rank}</span>
						{/each}
					</div>

					<!-- 5x5 Board Grid -->
					<div class="grid grid-cols-5 rounded-xl bg-white p-1.5 shadow-sm">
						{#each startingBoard as row, rIndex}
							{#each row as cell, cIndex}
								{@const square = `${files[cIndex]}${5 - rIndex}`}
								<Square
									isDark={(cIndex + rIndex) % 2 === 0}
									{square}
									row={rIndex}
									col={cIndex}
									cellSize={44}
									piece={cell}
								>
									{#if cell}
										<Piece type={cell.type} color={cell.color} />
									{/if}
								</Square>
							{/each}
						{/each}
					</div>
				</div>

				<!-- File labels -->
				<div class="mt-2 ml-5 flex w-55 justify-around font-mono text-xs text-zinc-400 select-none">
					{#each files as file}
						<span class="w-11 text-center">{file}</span>
					{/each}
				</div>
			</div>

			<span class="text-center text-xs text-zinc-400">
				Back rank layout: Rook &bull; Knight &bull; Bishop &bull; Queen &bull; King
			</span>
		</section>

		<!-- Divider -->
		<hr class="border-zinc-200" />

		<!-- Rule Differences (Editorial Definition List) -->
		<section class="flex flex-col gap-4">
			<h2 class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Key Differences</h2>

			<div class="flex flex-col divide-y divide-zinc-200/80">
				<div class="py-4 first:pt-0">
					<h3 class="text-sm font-medium text-zinc-900">No Double Pawn Step</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						Pawns can only advance one square at a time, including on their initial move. Captures remain strictly
						diagonally forward.
					</p>
				</div>

				<div class="py-4">
					<h3 class="text-sm font-medium text-zinc-900">No En Passant</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						Because pawns never leap two squares forward, en passant does not exist.
					</p>
				</div>

				<div class="py-4">
					<h3 class="text-sm font-medium text-zinc-900">No Castling</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						There is no castling. Rooks and Kings start on their home squares and move as normal pieces.
					</p>
				</div>

				<div class="py-4 last:pb-0">
					<h3 class="text-sm font-medium text-zinc-900">Immediate Promotion</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						Advancing a pawn to the opponent's back rank (rank 5 for White, rank 1 for Black) instantly promotes it into
						a Queen.
					</p>
				</div>
			</div>
		</section>

		<!-- Divider -->
		<hr class="border-zinc-200" />

		<!-- Win Conditions & Clocks -->
		<section class="flex flex-col gap-4">
			<h2 class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Match Rules</h2>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div>
					<h3 class="text-sm font-medium text-zinc-900">Time Control</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						5 minutes per player. If your clock hits zero, your opponent wins on time.
					</p>
				</div>

				<div>
					<h3 class="text-sm font-medium text-zinc-900">Checkmate</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						Standard checkmate applies when a King is attacked and cannot escape or be shielded.
					</p>
				</div>

				<div>
					<h3 class="text-sm font-medium text-zinc-900">Stalemate</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						A player with no legal moves who is not in check draws immediately.
					</p>
				</div>

				<div>
					<h3 class="text-sm font-medium text-zinc-900">Insufficient Material</h3>
					<p class="mt-1 text-sm leading-relaxed text-zinc-600">
						King vs. King or King with a single minor piece vs. King results in an automatic draw.
					</p>
				</div>
			</div>
		</section>

		<!-- Divider -->
		<hr class="border-zinc-200" />

		<!-- Tactics / Strategy -->
		<section class="flex flex-col gap-4">
			<h2 class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Strategy Notes</h2>

			<ul class="space-y-3 text-sm leading-relaxed text-zinc-600">
				<li class="flex gap-2">
					<span class="font-mono text-zinc-400 select-none">&mdash;</span>
					<span
						><strong class="font-medium text-zinc-900">Passed pawns are lethal:</strong> With pawns only three steps away
						from the back rank, creating a passed pawn is often an immediate route to victory.</span
					>
				</li>
				<li class="flex gap-2">
					<span class="font-mono text-zinc-400 select-none">&mdash;</span>
					<span
						><strong class="font-medium text-zinc-900">Instant combat:</strong> Only one empty rank separates the pawn lines.
						Tension and trades begin on moves 1 and 2.</span
					>
				</li>
				<li class="flex gap-2">
					<span class="font-mono text-zinc-400 select-none">&mdash;</span>
					<span
						><strong class="font-medium text-zinc-900">King vulnerability:</strong> Without castling, Kings stay near the
						center. Keep defenders close to avoid sudden mating nets.</span
					>
				</li>
			</ul>
		</section>

		<!-- Divider -->
		<hr class="border-zinc-200" />

		<!-- History & Game Theory -->
		<section class="flex flex-col gap-4">
			<h2 class="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Origins & Game Theory</h2>

			<div class="flex flex-col gap-3 text-sm leading-relaxed text-zinc-600">
				<p>
					Minichess was originally conceived by Martin Gardner in 1962. However, this specific ruleset was codified in the
					1980s by the <strong class="font-medium text-zinc-900">AISE</strong> (<em
						>Associazione Italiana Scacchi Eterodossi</em
					>), who removed castling and the pawn double-step to eliminate awkward king hops and premature turn-one clashes
					on a 5-wide grid.
				</p>
				<p>
					In 2013, computer scientists Mehdi Mhalla and Frédéric Prost mathematically <strong
						class="font-medium text-zinc-900">weakly solved</strong
					> AISE Minichess, proving that with flawless play from both players, the game is a forced draw. Despite this theoretical
					balance, the razor-thin margin for error makes it one of the most volatile and unforgiving tactical testing grounds
					in chess.
				</p>
			</div>
		</section>

		<!-- Footer CTA -->
		<footer class="mt-4 flex flex-col items-center gap-3 pb-16 text-center">
			<Button size="lg" class="bg-dark cursor-pointer px-8 text-base text-white" onclick={() => goto("/")}>Play</Button>
		</footer>
	</div>
</main>
