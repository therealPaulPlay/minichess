<script lang="ts">
	import Sword from "./Sword.svelte";
	import type { Piece } from "$lib/engine/types";
	import type { Snippet } from "svelte";

	let {
		square,
		cellSize = 60,
		isDark,
		isHighlighted,
		isSelected,
		piece,
		onclick,
		children,
	}: {
		square?: string;
		cellSize?: number;
		isDark: boolean;
		isHighlighted?: boolean;
		isSelected?: boolean;
		piece?: Piece | null;
		onclick?: any;
		children?: Snippet;
	} = $props();

	const darkColour = "#d6d9db";
	const lightColour = "#f9f9fa";
	const darkPieceColour = "#404141";

	const showDot = true;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative flex items-center justify-center squircle"
	style="
        width: {cellSize}px; 
        height: {cellSize}px; 
        background-color: {isDark ? darkColour : lightColour};
    "
	class:bg-[#b8d7f2]!={isHighlighted && !isDark && !showDot}
	class:bg-[#8fb7dc]!={isHighlighted && isDark && !showDot}
	{onclick}
>
	<!-- Non-interactable hover outline layer -->
	<!-- <div
		class="pointer-events-none absolute inset-0 z-50 ring-1 ring-dark/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
	></div> -->

	<!-- TODO: Maybe have it such that if the highlighted square has a piece, we show a sword icon instead of a dot? -->
	{#if isHighlighted && showDot}
		{#if piece}
			<Sword class="absolute {piece.color == 'b' ? 'text-white/60' : 'text-black/20'} rotate-45 scale-75" />
		{:else}
			<div class="absolute w-2 h-2 bg-black/20 rounded-full"></div>
		{/if}
	{/if}
	{@render children?.()}
</div>
