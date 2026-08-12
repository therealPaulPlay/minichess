<script lang="ts">
	import type { Component } from "svelte";
	import type { PieceType, PieceColor } from "../../engine/types";

	import PawnIcon from "$lib/components/chess-pieces/PawnIcon.svelte";
	import QueenIcon from "$lib/components/chess-pieces/QueenIcon.svelte";
	import RookIcon from "$lib/components/chess-pieces/RookIcon.svelte";
	import BishopIcon from "$lib/components/chess-pieces/BishopIcon.svelte";
	import KnightIcon from "$lib/components/chess-pieces/KnightIcon.svelte";
	import KingIcon from "$lib/components/chess-pieces/KingIcon.svelte";

	let { type, color }: { type: PieceType; color: PieceColor } = $props();

	const iconMap: Record<PieceType, Component<any>> = {
		p: PawnIcon,
		n: KnightIcon,
		b: BishopIcon,
		r: RookIcon,
		q: QueenIcon,
		k: KingIcon,
	};

	const sizeMap: Record<PieceType, string> = {
		p: "scale-65",
		n: "scale-85",
		b: "scale-100",
		r: "scale-85",
		q: "scale-100",
		k: "scale-100",
	};
</script>

<div
	class={[
		"flex justify-center items-center self-center w-full h-full",
		color === "w" && "text-white",
		color === "b" && "text-black",
	]}
>
	{#if type}
		{const Component = iconMap[type]}
		<Component class="w-full h-full p-3 my-2 overflow-visible transition-transform {sizeMap[type]}" draggable="true" />
	{/if}
</div>
