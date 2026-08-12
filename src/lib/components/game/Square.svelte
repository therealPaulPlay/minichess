<script lang="ts">
	import Piece from './Piece.svelte'
	import type { Snippet } from 'svelte'

	let {
		square,
		cellSize = 60,
		isDark,
		isHighlighted,
		isSelected,
		onclick,
		children,
	}: {
		square: string
		cellSize?: number
		isDark: boolean
		isHighlighted?: boolean
		isSelected?: boolean
		onclick?: any
		children?: Snippet
	} = $props()

	const darkColour = $state('#d6d9db')
	const lightColour = $state('#f9f9fa')
	const darkPieceColour = $state('#404141')
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex items-center justify-center rounded transition-shadow ring-0 ring-dark/0 hover:ring-1 hover:ring-dark/50 hover:z-50 ease-in"
	style="
			width: {cellSize}px; 
			height: {cellSize}px; 
			background-color: {isDark ? darkColour : lightColour};
		"
	{onclick}
>
	{#if isHighlighted}
		<div class="absolute w-4 h-4 bg-black/20 rounded-full"></div>
	{/if}
	{@render children?.()}
</div>
