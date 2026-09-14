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
		showSword = true,
		showDot = true,
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
		showSword?: boolean;
		showDot?: boolean;
		piece?: Piece | null;
		onclick?: (_event: MouseEvent) => void;
		children?: Snippet;
	} = $props();

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
		style="background-color: {isDark ? 'var(--chess-field-dark)' : 'var(--chess-field-light)'};"
		class:bg-[#b8d7f2]!={isHighlighted && !isDark && !showDot}
		class:bg-[#8fb7dc]!={isHighlighted && isDark && !showDot}
	></div>

	{#if isHighlighted && showDot}
		{#if piece && showSword}
			<Sword
				class="pointer-events-none absolute z-40 {piece.color == 'black'
					? 'text-white/60'
					: 'text-black/20'} scale-75 rotate-45"
			/>
		{:else}
			<div class="pointer-events-none absolute z-10 h-2 w-2 rounded-full bg-black/20"></div>
		{/if}
	{/if}

	{@render children?.()}
</div>

<style>
	.squircle {
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0,50 C0,10 10,0 50,0 C90,0 100,10 100,50 C100,90 90,100 50,100 C10,100 0,90 0,50 Z'/%3E%3C/svg%3E");
		-webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0,50 C0,10 10,0 50,0 C90,0 100,10 100,50 C100,90 90,100 50,100 C10,100 0,90 0,50 Z'/%3E%3C/svg%3E");
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
	}
</style>

