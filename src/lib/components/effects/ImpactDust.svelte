<script lang="ts">
	import type { PieceColor } from "$lib/engine/types";

	let { trigger = 0, color = "white" }: { trigger?: number; color?: PieceColor } = $props();

	let isPlaying = $state(false);
	let lastTrigger: number | undefined;

	$effect(() => {
		if (trigger > 0 && lastTrigger !== undefined && trigger !== lastTrigger) {
			isPlaying = false;

			requestAnimationFrame(() => {
				isPlaying = true;
			});
		}
		lastTrigger = trigger;
	});
</script>

<svg viewBox="0 0 48.93 15.6" class="pointer-events-none h-4 overflow-visible">
	<path
		class="opacity-0 {color === 'white' ? 'fill-(--chess-piece-light)' : 'fill-black'} {isPlaying
			? 'animate-poof'
			: ''}"
		d="M0,15.6h44.5s2.82,0,2.82-2.82c0,0,1.62-.44,1.62-6.54,0-1.53-1.1-2.74-2.16-2.83-1.26-.1-2.52,1.08-2.52,1.08,0,0-.56-4.49-8.05-4.49-9.29,0-10.88,7.8-10.88,7.8,0,0-7.16-.47-8.98,1.73-2.66,3.22-1.68-.14-9.37,2.52-3.16,1.09,8.73.83-6.98,3.55Z"
	/>
</svg>

<style>
	.animate-poof {
		animation: poof 750ms cubic-bezier(0, 1, 1, 1) forwards;
		transform-origin: bottom center;
	}

	@keyframes poof {
		0% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		100% {
			opacity: 0;
			/* Moves outward/upwards and expands slightly as it fades */
			transform: translateX(8px);
		}
	}
</style>
