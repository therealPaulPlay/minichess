<script lang="ts">
	import type { Component } from "svelte";
	import type { PieceType, PieceColor } from "../../engine/types";

	import PawnIcon from "$lib/components/chess-pieces/PawnIcon.svelte";
	import QueenIcon from "$lib/components/chess-pieces/QueenIcon.svelte";
	import RookIcon from "$lib/components/chess-pieces/RookIcon.svelte";
	import BishopIcon from "$lib/components/chess-pieces/BishopIcon.svelte";
	import KnightIcon from "$lib/components/chess-pieces/KnightIcon.svelte";
	import KingIcon from "$lib/components/chess-pieces/KingIcon.svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		type,
		color,
		draggable = false,
		class: className = "",
		...props
	}: {
		type: PieceType;
		color: PieceColor;
		draggable?: boolean;
		class?: string;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const iconMap: Record<PieceType, Component<any>> = {
		p: PawnIcon,
		n: KnightIcon,
		b: BishopIcon,
		r: RookIcon,
		q: QueenIcon,
		k: KingIcon,
	};

	const Icon = $derived(iconMap[type]);
</script>

<div
	class={[
		"z-20 flex h-full w-full items-center justify-center self-center overflow-visible",
		color === "w" ? "text-(--chess-piece-light)" : "text-black",
		className,
	]}
	{...props}
>
	{#if Icon}
		<Icon class={["my-2 h-full w-full overflow-visible p-3", draggable && "hover:cursor-grab"]} />
	{/if}
</div>
