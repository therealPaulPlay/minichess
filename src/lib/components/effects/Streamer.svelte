<!-- components/effects/Streamer.svelte -->
<script lang="ts">
	import { game } from "$lib/stores/gameStore.svelte";

	let { trigger = 0 } = $props();

	let isPlaying = $state(false);
	let ctrlX = $state(50);
	let midX = $state(50);

	function getRandomInt(min: number, max: number) {
		const minCeiled = Math.ceil(min);
		const maxFloored = Math.floor(max);
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
	}

	$effect(() => {
		if (trigger === 0) return;

		isPlaying = false;

		requestAnimationFrame(() => {
			ctrlX = getRandomInt(25, 80);
			midX = getRandomInt(20, ctrlX);
			isPlaying = true;
		});
	});
</script>

<svg viewBox="0 0 100 100" class="pointer-events-none h-6 w-6 overflow-visible">
	<path
		class="fill-none {game.turn == 'w'
			? 'stroke-(--chess-piece-light)'
			: 'stroke-black'} stroke-8 [stroke-dasharray:40_300] [stroke-dashoffset:40] [stroke-linecap:round] {isPlaying
			? 'animate-swoosh'
			: ''}"
		d="M 0 0 Q {ctrlX} 0 {midX} 50 T 100 100"
	/>
</svg>

<style>
	@keyframes swoosh {
		0% {
			stroke-dashoffset: 40;
		}
		100% {
			stroke-dashoffset: -280;
		}
	}

	.animate-swoosh {
		animation: swoosh 0.6s ease-out forwards;
	}
</style>
