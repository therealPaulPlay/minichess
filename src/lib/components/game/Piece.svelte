<script lang="ts">
	import type { PieceType, PieceColor } from "../../engine/types";

	import PawnIcon from "$lib/components/chess-pieces/PawnIcon.svelte";
	import QueenIcon from "$lib/components/chess-pieces/QueenIcon.svelte";
	import RookIcon from "$lib/components/chess-pieces/RookIcon.svelte";
	import BishopIcon from "$lib/components/chess-pieces/BishopIcon.svelte";
	import KnightIcon from "$lib/components/chess-pieces/KnightIcon.svelte";
	import KingIcon from "$lib/components/chess-pieces/KingIcon.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Component } from "svelte";
	import Streamer from "$lib/components/effects/Streamer.svelte";

	let {
		type,
		color,
		draggable = false,
		class: className = "",
		triggerEffect = 0,
		...props
	}: {
		type: PieceType;
		color: PieceColor;
		draggable?: boolean;
		class?: string;
		triggerEffect?: number;
		streamerCount?: number;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const iconMap: Record<PieceType, Component> = {
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
		"relative z-20 flex h-full w-full items-center justify-center self-center overflow-visible",
		color === "w" ? "text-(--chess-piece-light)" : "text-black",
		className,
	]}
	{...props}
>
	{#if Icon}
		<Icon class="my-2 h-full w-full overflow-visible p-3 {draggable ? 'hover:cursor-grab' : ''}" />
	{/if}
	<!-- Streamers Overlay -->
	<div class="pointer-events-none absolute inset-0 -top-6 flex items-center justify-center">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		<div class="rotate-180">
			<Streamer trigger={triggerEffect} />
		</div>
		<div class="-translate-y-3 rotate-255">
			<Streamer trigger={triggerEffect} />
		</div>
		<div class="-rotate-90">
			<Streamer trigger={triggerEffect} />
		</div>
	</div>
</div>
