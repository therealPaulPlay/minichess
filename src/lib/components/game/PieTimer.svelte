<script lang="ts">
	const LOW_TIME_ALRT_THRESHOLD = 10; // Seconds
	let { percentage }: { percentage: number } = $props();

	const safePercentage = $derived(Math.min(Math.max(percentage, 0), 100));
</script>

<div
	class="h-8 w-8 rounded-full"
	style="--percentage: {safePercentage}%"
	class:pie-gradient={safePercentage > 0}
	class:bg-red-400={safePercentage <= 0}
	class:animate-low-time={safePercentage <= LOW_TIME_ALRT_THRESHOLD * 0 /* TODO get actual time from multiplayer time system */}
></div>

<style>
	.pie-gradient {
		background-image: conic-gradient(
			var(--chess-piece-light) var(--percentage),
			var(--chess-field-dark) calc(var(--percentage) + 0.75%)
				/* The 0.75% here is to soften the transition otherwise it'd look pixelated */
		);
	}

	.animate-low-time {
		animation: scaleAndTilt 0.5s ease-out;
	}

	@keyframes scaleAndTilt {
		0% {
			transform: scale(1) rotate(0deg);
		}
		25% {
			transform: scale(1.2) rotate(8deg);
		}
		50% {
			transform: scale(1.2) rotate(-8deg);
		}
		75% {
			transform: scale(1.2) rotate(8deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}
</style>
