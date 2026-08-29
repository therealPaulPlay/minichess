<script lang="ts">
	import { multiplayerState } from "$lib/stores/multiplayerStore.svelte";
	import KingIcon from "../chess-pieces/KingIcon.svelte";
</script>

<div class="relative flex h-14 w-8 justify-center rounded-full bg-(--chess-field-dark) p-1 inset-shadow-sm inset-shadow-black/15">
	<div
		class="bg-light absolute h-6 w-6 rounded-full shadow-sm inset-shadow-xs inset-shadow-white transition-transform"
		class:translate-y-6={multiplayerState.storage?.turn === "white"}
		class:translate-y-0={multiplayerState.storage?.turn === "black"}
	></div>

	<div
		class="absolute top-1 flex h-6 w-6 items-center justify-center p-1 transition-opacity"
		class:opacity-5={multiplayerState.storage?.turn === "white"}
		class:tilt-n-move-shaking={multiplayerState.storage?.turn  === "black" && multiplayerState.storage?.status?.isCheck}
	>
		<KingIcon class=" rotate-180 text-black" />
	</div>

	<div
		class="absolute bottom-1 flex h-6 w-6 items-center justify-center p-1 transition-opacity"
		class:opacity-30={multiplayerState.storage?.turn === "black"}
		class:tilt-n-move-shaking={multiplayerState.storage?.turn === "white" && multiplayerState.storage?.status?.isCheck}
	>
		<KingIcon class="text-(--chess-piece-light) " />
	</div>
</div>

<style>
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
