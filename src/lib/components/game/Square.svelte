<script lang="ts">
	import Piece from "./Piece.svelte";
	import type { Snippet } from "svelte";

	let {
		square,
		cellSize = 60,
		isDark,
		isHighlighted,
		isSelected,
		onclick,
		children,
	}: {
		square?: string;
		cellSize?: number;
		isDark: boolean;
		isHighlighted?: boolean;
		isSelected?: boolean;
		onclick?: any;
		children?: Snippet;
	} = $props();

	const darkColour = "#d6d9db";
	const lightColour = "#f9f9fa";
	const darkPieceColour = "#404141";
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative flex items-center justify-center"
	style="
        width: {cellSize}px; 
        height: {cellSize}px; 
        background-color: {isDark ? darkColour : lightColour};
    "
	{onclick}
>
	<!-- Non-interactable hover outline layer -->
	<!-- <div
		class="pointer-events-none absolute inset-0 z-50 ring-1 ring-dark/50 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
	></div> -->

	{#if isHighlighted}
		<div class="absolute w-4 h-4 bg-black/20 rounded-full"></div>
	{/if}
	{@render children?.()}
</div>
