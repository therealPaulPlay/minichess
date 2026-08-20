<script lang="ts">
	import Sword from "./Sword.svelte";
	import type { Piece } from "$lib/engine/types";
	import type { Snippet } from "svelte";

	let {
		square,
		row,
		col,
		cellSize = 60,
		isDark,
		isHighlighted,
		isSelected,
		piece,
		onclick,
		children,
	}: {
		square?: string;
		row?: number;
		col?: number;
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
	class="group relative flex touch-none items-center justify-center select-none"
	data-square={square}
	data-row={row}
	data-col={col}
	style="width: {cellSize}px; height: {cellSize}px;"
	{onclick}
>
	<div
		class="squircle pointer-events-none absolute inset-0"
		style="background-color: {isDark ? darkColour : lightColour};"
		class:bg-[#b8d7f2]!={isHighlighted && !isDark && !showDot}
		class:bg-[#8fb7dc]!={isHighlighted && isDark && !showDot}
	></div>

	{#if isHighlighted && showDot}
		{#if piece}
			<Sword
				class="pointer-events-none absolute z-40 {piece.color == 'b'
					? 'text-white/60'
					: 'text-black/20'} scale-75 rotate-45"
			/>
		{:else}
			<div class="pointer-events-none absolute z-10 h-2 w-2 rounded-full bg-black/20"></div>
		{/if}
	{/if}

	<!-- 3. Piece Render (Unclipped) -->
	{@render children?.()}
</div>
