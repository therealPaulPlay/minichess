<script lang="ts">
	import type { PieceColor } from "$lib/engine/types";
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import KingIcon from "../chess-pieces/KingIcon.svelte";

	let {
		whitePercentage,
		blackPercentage,
		turn,
	}: { whitePercentage: number; blackPercentage: number; turn: PieceColor } = $props();

	const inCheck = $derived(multiplayerState.storage.status?.isCheck);

	const MAX_FILL = 90;
	const blackY = $derived((blackPercentage / 100) * MAX_FILL);
	const whiteY = $derived(200 - (whitePercentage / 100) * MAX_FILL);
</script>

<div class="relative flex h-14 w-8 justify-center p-1">
	<svg viewBox="0 0 32 200" class="absolute top-1/2 h-50 w-8 -translate-y-1/2 text-(--chess-field-dark)">
		<defs>
			<!-- Clip path for masking -->
			<clipPath id="track-clip">
				<path
					d="
                        M 8 8 
                        A 8 8 0 0 1 24 8
                        L 24 74
                        A 16 16 0 0 1 32 88
                        L 32 112
                        A 16 16 0 0 1 24 126
                        L 24 192
                        A 8 8 0 0 1 8 192
                        L 8 126
                        A 16 16 0 0 1 0 112
                        L 0 88
                        A 16 16 0 0 1 8 74
                        Z
                    "
				/>
			</clipPath>

			<!-- Inner shadow filter -->
			<filter id="path-inset-shadow">
				<feGaussianBlur stdDeviation="1.5" result="offset-blur" />
				<feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
				<feFlood flood-color="black" flood-opacity="0.25" result="color" />
				<feComposite operator="in" in="color" in2="inverse" result="shadow" />
			</filter>
		</defs>

		<!-- Background shape -->
		<path
			d="
                M 8 8 
                A 8 8 0 0 1 24 8
                L 24 74
                A 16 16 0 0 1 32 88
                L 32 112
                A 16 16 0 0 1 24 126
                L 24 192
                A 8 8 0 0 1 8 192
                L 8 126
                A 16 16 0 0 1 0 112
                L 0 88
                A 16 16 0 0 1 8 74
                Z
            "
			fill="currentColor"
		/>

		<g clip-path="url(#track-clip)">
			<!-- Black time -->
			<g class="transition-transform duration-300 ease-out" style="transform: translateY({blackY}px);">
				<path
					d="M -36 0 q 3 1.5 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 v -220 h -96 Z"
					class="wave-black fill-(--chess-piece-light) transition-opacity duration-300"
					class:opacity-20={turn === "white"}
				/>
			</g>

			<!-- White time -->
			<g class="transition-transform duration-300 ease-out" style="transform: translateY({whiteY}px);">
				<path
					d="M -36 0 q 3 -1.5 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0 v 220 h -96 Z"
					class="wave-white fill-(--chess-piece-light) transition-opacity duration-300"
					class:opacity-20={turn === "black"}
				/>
			</g>
		</g>

		<!-- Inset Shadow Overlay -->
		<path
			d="
                M 8 8 
                A 8 8 0 0 1 24 8
                L 24 74
                A 16 16 0 0 1 32 88
                L 32 112
                A 16 16 0 0 1 24 126
                L 24 192
                A 8 8 0 0 1 8 192
                L 8 126
                A 16 16 0 0 1 0 112
                L 0 88
                A 16 16 0 0 1 8 74
                Z
            "
			fill="black"
			filter="url(#path-inset-shadow)"
			class="pointer-events-none"
		/>
	</svg>

	<!-- Inidcator circle -->
	<div
		class="bg-light absolute h-6 w-6 rounded-full shadow-sm inset-shadow-xs inset-shadow-white transition-transform"
		class:translate-y-6={turn === "white"}
		class:translate-y-0={turn === "black"}
	></div>

	<div
		class="absolute top-1 flex h-6 w-6 items-center justify-center p-1 transition-opacity"
		class:opacity-5={turn === "white"}
		class:tilt-n-move-shaking={turn === "black" && inCheck}
	>
		<KingIcon class="rotate-180 text-black" />
	</div>

	<div
		class="absolute bottom-1 flex h-6 w-6 items-center justify-center p-1 transition-opacity"
		class:opacity-30={turn === "black"}
		class:tilt-n-move-shaking={turn === "white" && inCheck}
	>
		<KingIcon class="text-(--chess-piece-light)" />
	</div>
</div>

<style>
	.wave-black,
	.wave-white {
		transform-box: view-box;
	}

	.wave-black {
		animation: wave-slide 2.5s linear infinite;
	}

	.wave-white {
		animation: wave-slide-reverse 3s linear infinite;
	}

	@keyframes wave-slide {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-12px);
		}
	}

	@keyframes wave-slide-reverse {
		from {
			transform: translateX(-12px);
		}
		to {
			transform: translateX(0);
		}
	}

	.tilt-n-move-shaking {
		animation: tilt-n-move-shaking 0.25s ease-in infinite;
	}

	@keyframes tilt-n-move-shaking {
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		25% {
			transform: translate(1px, 1px) rotate(3deg);
		}
		50% {
			transform: translate(0, 0) rotate(0deg);
		}
		75% {
			transform: translate(-1px, 1px) rotate(-3deg);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
</style>
