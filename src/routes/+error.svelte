<script>
	import { page } from "$app/state";
	import QueenIcon from "$lib/components/chess-pieces/QueenIcon.svelte";
	import PawnIcon from "$lib/components/chess-pieces/PawnIcon.svelte";
</script>

<svelte:head>
	<title>Error</title>
</svelte:head>

<div class="min-h-svh content-center space-y-4 text-center">
	{#if page.status == 404}
		<div class="flex justify-center">
			<div class="relative h-fit w-fit text-[12rem] font-extralight select-none">
				404
				<div class="soft-fade-mask pointer-events-none absolute inset-0">
					<div class="queen-animation absolute right-10 bottom-4">
						<QueenIcon class="h-auto w-12" />
					</div>
					<div class="pawn-animation absolute -bottom-1 left-4">
						<PawnIcon class="h-auto w-10 text-(--chess-piece-light)" />
					</div>
				</div>
			</div>
		</div>
		<p class="text-2xl font-extralight text-(--chess-piece-light) md:text-3xl">{page.error?.message || "Unknown"}</p>
	{:else}
		<p class="text-2xl md:text-3xl">{page.status} ({page.error?.message || "Unknown"})</p>
		<p>Checkmate.</p>
	{/if}
</div>

<style>
	.soft-fade-mask {
		/* Soft fade-in on the left 48px, solid everywhere else */
		-webkit-mask-image: linear-gradient(to right, transparent 0px, black 48px, black 100%);
		mask-image: linear-gradient(to right, transparent 0px, black 48px, black 100%);
	}

	.pawn-animation {
		offset-path: path("M -40 0 L 230 0 C 230 -40 210 -130 160 -130");
		offset-rotate: 0deg;
		transform-origin: center;
		animation:
			movePawn 4s forwards infinite,
			spinPawn 4s forwards infinite;
	}

	.queen-animation {
		animation: moveQueen 4s forwards infinite;
	}

	@keyframes movePawn {
		0% {
			offset-distance: 0%;
			opacity: 1;
		}
		35% {
			opacity: 1;
			transform: scale(1);
			animation-timing-function: cubic-bezier(0, 0.75, 0.5, 0.9);
		}
		67% {
			opacity: 1;
			animation-timing-function: cubic-bezier(0, 0.75, 0.5, 0.9);
		}
		100% {
			offset-distance: 100%;
			opacity: 0;
		}
	}

	@keyframes spinPawn {
		0%,
		35% {
			transform: rotate(0deg);
			animation-timing-function: ease-out;
		}
		100% {
			transform: rotate(-600deg) scale(0);
		}
	}

	@keyframes moveQueen {
		0%,
		28% {
			transform: translate(0, 0);
		}
		33% {
			transform: translate(20px, -20px) rotate(-20deg);
			animation-timing-function: ease-in;
		}
		35% {
			transform: translate(0, 0);
		}
		37% {
			transform: translate(-10px, -10px) rotate(10deg);
		}

		50%,
		100% {
			transform: translate(0, 0);
		}
	}
</style>
