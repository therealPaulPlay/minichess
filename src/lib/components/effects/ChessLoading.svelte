<script lang="ts">
	import PawnIcon from "../chess-pieces/PawnIcon.svelte";
	import QueenIcon from "../chess-pieces/QueenIcon.svelte";
</script>

<div class="overflow-hidden px-6 py-8">
	<div class="relative flex flex-row-reverse gap-4">
		{#each [0, 1, 2] as i}
			<div class="hop" style:--delay="{i * 0.2}s">
				<PawnIcon class="text-(--chess-piece-light)" />
			</div>
		{/each}
		<div class="move absolute">
			<QueenIcon class="text-black" />
		</div>
	</div>
</div>

<style>
	.hop {
		animation: pawn-hop 1s infinite;
		animation-delay: var(--delay, 0s);
	}

	.move {
		animation: queen-move 1s linear infinite;
	}
	@keyframes pawn-hop {
		0% {
			transform: translate(0, 0) scale(1, 1) rotate(0deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		}
		15% {
			transform: translate(0, 4px) scale(1.15, 0.85) rotate(-5deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
		}

		45% {
			transform: translate(0px, -30px) scale(0.9, 1.1) rotate(180deg);
			animation-timing-function: cubic-bezier(0.8, 0, 0.6, 1);
		}

		70% {
			transform: translate(0px, 0px) scale(1.2, 0.8) rotate(360deg);
			animation-timing-function: cubic-bezier(0.3, 1.5, 0.5, 1);
		}

		85% {
			transform: translate(00px, -4px) scale(0.98, 1.02) rotate(360deg);
		}
		100% {
			transform: translate(0, 0) scale(1, 1) rotate(360deg);
		}
	}

	@keyframes queen-move {
		0% {
			transform: translate(250%, 0);
		}

		100% {
			transform: translate(-600%, 0);
		}
	}
</style>
